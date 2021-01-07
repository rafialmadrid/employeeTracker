const mysql = require("mysql");
const inquirer=require("inquirer");
const logo=require("asciiart-logo");
const cTable = require('console.table');

var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "Rafa*2690",
  database: "employees_db"
});

connection.connect(function(err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId + "\n");

  const logoText = logo({ name: "Employee Manager" }).render();
  console.log(logoText);

  askAction();
});

function askAction(){ 
    inquirer
                    .prompt([
                          {
                            type: 'list',
                            message: 'What would you like to do?',
                            name: 'action',
                            choices: ["Add Department", "Add Role", "Add Employee", "View Departments", "View Roles", "View Employees", "Update Employee Roles"]
                          }
                    ]).then((response) => {

                      switch (response.action) {
                        
                        case "Add Department":
                          addDepartment();
                          break;
                        case "Add Role":
                          addRole();
                          break;
                        case "Add Employee":
                          addEmployee();
                          break;
                        case "View Departments":
                          readDepartments();
                          break;
                        case "View Roles":
                          readRoles();
                          break;  
                        case "View Employees":
                          readEmployees();
                          break;
                        case "Update Employee Roles":
                          updateEmployeeRole();
                          break;    
                        }    
                    });
                }


  function readDepartments() {
  connection.query("SELECT id, name FROM department", function(err, res) {
    if (err) throw err;
    console.table(res);
    askAction();
  });
  }

  function readEmployees() {
  connection.query("SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name, role.salary FROM department, role, employee WHERE department.id=role.department_id AND role.id=employee.role_id", function(err, res) {
    if (err) throw err;
    console.table(res);
    askAction();
  });
  }

  function readRoles() {
  connection.query("SELECT id, title, salary FROM role", function(err, res) {
    if (err) throw err;
    console.table(res);
    askAction();
  });
  }

  function addDepartment() {
    inquirer
      .prompt([
        {
          name: 'dept',
          type: 'input',
          message: 'What is the new department?',
        }
      ])
      .then(function (answer) {
        connection.query(
          'INSERT INTO department SET ?',
          {
            name: answer.dept
          },
          function (err) {
            if (err) throw err;
            console.log('New department added..');
            askAction();
          }
        );
      });
  }

  function addRole() {

    connection.query('SELECT * FROM department', function (err, results) {
      if (err) throw err;

    inquirer
      .prompt([
        {
          name: 'title',
          type: 'input',
          message: 'What is the new title for the role?',
        },
        {
          name: 'salary',
          type: 'input',
          message: 'What would be the salary for the new role?',
          validate: function (value) {
            if (isNaN(value) === false) {
              return true;
            }
            return false;
          },
        },
        {
          name: 'choice',
          type: 'rawlist',
          choices: function () {
            let choiceArray = [];
            for (var i = 0; i < results.length; i++) {
              choiceArray.push(results[i].id);
            }
              return choiceArray;
            },
          message: 'What is the ID of the department?',
        },
      ])
      .then(function (answer) {
        connection.query(
          'INSERT INTO role SET ?',
          {
            title: answer.title,
            salary: answer.salary,
            department_id: answer.choice
          },
          function (err) {
            if (err) throw err;
            console.log('The new role was added..');
            askAction();
          }
        );
      });
    });
  }

  function addEmployee() {

    connection.query('SELECT * FROM role', function (err, results) {
      if (err) throw err;

    inquirer
      .prompt([
        {
          name: 'firstName',
          type: 'input',
          message: 'What is the name of the new employee?',
        },
        {
          name: 'lastName',
          type: 'input',
          message: 'What is the last name of the new employee?',
        },
        {
          name: 'choice',
          type: 'rawlist',
          choices: function () {
            let choiceArray = [];
            for (var i = 0; i < results.length; i++) {
              choiceArray.push(results[i].id);
            }
              return choiceArray;
            },
          message: 'What is the ID of the role?',
        },
      ])
      .then(function (answer) {
        connection.query(
          'INSERT INTO employee SET ?',
          {
            first_name: answer.firstName,
            last_name: answer.lastName,
            role_id: answer.choice,
            manager_id: null
          },
          function (err) {
            if (err) throw err;
            console.log('The new employee was added..');
            askAction();
          }
        );
      });
    });
  }

  function updateEmployeeRole() {

    connection.query('SELECT * FROM employee', function (err, results) {
      if (err) throw err;

      inquirer
        .prompt([
          {
            name: 'choiceEmp',
            type: 'rawlist',
            choices: function () {
              let choiceArrayEmp = [];
              for (var i = 0; i < results.length; i++) {
                choiceArrayEmp.push(results[i].id);
              }
              return choiceArrayEmp;
            },
            message: 'Select the employee ID you want to update?',
          }
        ])
        .then(function (answer) {

          connection.query('SELECT * FROM role', function (err, results2) {
            if (err) throw err;

            inquirer
               .prompt([
                {
                name: 'choiceRole',
                type: 'rawlist',
                choices: function () {
                  let choiceArrayRole = [];
                  for (var i = 0; i < results2.length; i++) {
                    choiceArrayRole.push(results2[i].id);
                  }
                  return choiceArrayRole;
                },
                message: 'Select the role ID you want to assign?',
                }
                ])
                .then(function (answer2) {

                  connection.query(
                    'UPDATE employee SET ? WHERE ?',
                    [
                      {
                        role_id: answer2.choiceRole,
                      },
                      {
                        id: answer.choiceEmp,
                      },
                    ],
                    function (error) {
                      if (error) throw err;
                      console.log('Role updated succesfully...');
                      askAction();
                    }
                  );



                });

        });
        });          
    });
  }

