const http = require('http');
const fs = require('fs');
const { stringify } = require('querystring');

// Creating server
http.createServer((req, res) => {
    //logic
    if (req.url == '/' && req.method == 'GET') {
        console.log("Home Page");
        res.end();
    }
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////  STUDENTS API  ////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Add student(email must be unique)
    else if (req.url == '/addStudent' && req.method == 'POST') {
        // receive data
        let parsedData = '';
        req.on('data', (chunk) => {
            console.log('Data received');
            parsedData = JSON.parse(chunk)
        })
        req.on('end', () => {
            // Reading JSON file 
            const students = JSON.parse(fs.readFileSync("./students.json", "utf8") || "[]");

            // Check email
            const isEmailExist = students.find(student => student.email == parsedData.email);
            if (isEmailExist) {
                res.write('Email already exist');
                return res.end();
            }
            // Adding new data to students object 
            students.push(parsedData);

            // Writing to a file 
            fs.writeFileSync("./students.json", JSON.stringify(students));
            res.write("student added successfully");
            res.end();
        })
    }

    // Get all students
    else if (req.url == '/getAllStudents' && req.method == 'GET') {
        // Reading JSON file 
        const students = JSON.parse(fs.readFileSync("./students.json", "utf8") || "[]");
        res.write(JSON.stringify(students));
        res.end();
    }

    // Get all students with their department and courses related to the department
    else if (req.url == '/getAll' && req.method == 'GET') {
        // Reading JSON file 
        const students = JSON.parse(fs.readFileSync("./students.json", "utf8") || "[]");
        const courses = JSON.parse(fs.readFileSync("./courses.json", "utf8") || "[]");
        const departments = JSON.parse(fs.readFileSync("./departments.json", "utf8") || "[]");


        const modifyProperty = (arr) => {
            arr.forEach(student => {
                const departmentId = student.departmentId;
                let departmentsIndex = departments.find(department => department.id == departmentId)

                // Check if student has departemntID for a non-existing department
                if (!departmentsIndex) {
                    res.write("WARNING: A student has a departemntID for a non-existing department\n");
                    departmentsIndex = {};
                }

                // populate function
                student.department = {
                    "id": departmentsIndex.id,
                    "name": departmentsIndex.name
                };
                student.courses = []
                courses.forEach(course => {
                    if (course.departmentId == departmentId) {
                        student.courses.push({
                            "id": course.id,
                            "name": course.name,
                            "content": course.content
                        });
                    }
                });
            });
        };

        modifyProperty(students);
        res.write(JSON.stringify(students))
        res.end()
    }

    // Delete student by ID
    else if (req.url == '/deleteStudent' && req.method == 'DELETE') {
        // receive data
        let parsedData = '';
        req.on('data', (chunk) => {
            console.log('Data received');
            parsedData = JSON.parse(chunk)
        })
        req.on('end', () => {
            // Reading JSON file 
            const students = JSON.parse(fs.readFileSync("./students.json", "utf8") || "[]");

            const studentIdExist = students.find(student => student.id == parsedData.id);
            if (!studentIdExist) {
                res.write('That ID does not exist');
                return res.end();
            }
            // Adding new data to students object 
            console.log(studentIdExist);
            const newStudents = students.filter(student => student.id != parsedData.id)

            // Writing to a file 
            fs.writeFileSync("./students.json", JSON.stringify(newStudents));
            res.write("Student deleted successfully");
            res.end();
        })
    }

    // update student by ID
    else if (req.url == '/updateStudent' && req.method == 'PUT') {
        // receive data
        let parsedData = '';
        let valid = true;
        req.on('data', (chunk) => {
            console.log('Data received');
            parsedData = JSON.parse(chunk)
        })
        req.on('end', () => {
            // Reading JSON file 
            const students = JSON.parse(fs.readFileSync("./students.json", "utf8") || "[]");

            const studentIdExist = students.find(student => student.id == parsedData.id);
            if (!studentIdExist) {
                res.write('That ID does not exist');
                return res.end();
            }

            students.forEach(student => {
                if (parsedData.email == student.email && student.id != parsedData.id) {
                    valid = false;
                }
            });

            if (!valid) {
                res.write("update failed: email is already assigned to a different student");
                return res.end();

            }

            const studentIndex = students.findIndex(student => student.id == parsedData.id);
            const newStudents = students.with(studentIndex, parsedData)

            // Writing to a file 
            fs.writeFileSync("./students.json", JSON.stringify(newStudents));
            res.write("Student updated successfully");
            res.end();
        })
    }

    // Search for a student by ID
    else if (req.url == '/searchStudentId' && req.method == 'GET') {
        // receive data
        let parsedData = '';
        req.on('data', (chunk) => {
            console.log('Data received');
            parsedData = JSON.parse(chunk)
        })
        req.on('end', () => {
            // Reading JSON file 
            const students = JSON.parse(fs.readFileSync("./students.json", "utf8") || "[]");

            const studentIdExist = students.find(student => student.id == parsedData.id);
            if (!studentIdExist) {
                res.write('That ID does not exist');
                return res.end();
            }
            res.write(JSON.stringify(studentIdExist));
            res.end();
        })
    }

    // Sort students
    else if (req.url == '/sortStudents' && req.method == 'GET') {
        // Reading JSON file 
        const students = JSON.parse(fs.readFileSync("./students.json", "utf8") || "[]");
        students.sort(compare);

        function compare(a, b) {
            if (a.id < b.id) {
                return -1;
            }
            if (a.id > b.id) {
                return 1;
            }
            return 0;
        }

        // Writing to a file 
        fs.writeFileSync("./students.json", JSON.stringify(students));

        res.write("Students sorted successfully");
        res.end();
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////  COURSES API  ////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Add course(email must be unique)
    else if (req.url == '/addCourse' && req.method == 'POST') {
        // receive data
        let parsedData = '';
        req.on('data', (chunk) => {
            console.log('Data received');
            parsedData = JSON.parse(chunk)
        })
        req.on('end', () => {
            // Reading JSON file 
            const courses = JSON.parse(fs.readFileSync("./courses.json", "utf8") || "[]");

            // Check course name
            const isCourseExist = courses.find(course => course.name == parsedData.name);
            if (isCourseExist) {
                res.write('Course already exist');
                return res.end();
            }
            // Adding new data to courses object 
            courses.push(parsedData);

            // Writing to a file 
            fs.writeFileSync("./courses.json", JSON.stringify(courses));
            res.write("Course added successfully");
            res.end();
        })
    }

    // Get all courses
    else if (req.url == '/getAllCourses' && req.method == 'GET') {
        // Reading JSON file 
        const courses = JSON.parse(fs.readFileSync("./courses.json", "utf8") || "[]");
        res.write(JSON.stringify(courses));
        res.end();
    }

    // Delete course by ID
    else if (req.url == '/deleteCourse' && req.method == 'DELETE') {
        // receive data
        let parsedData = '';
        req.on('data', (chunk) => {
            console.log('Data received');
            parsedData = JSON.parse(chunk)
        })
        req.on('end', () => {
            // Reading JSON file 
            const courses = JSON.parse(fs.readFileSync("./courses.json", "utf8") || "[]");

            const courseID = courses.find(course => course.id == parsedData.id);
            if (!courseID) {
                res.write('That ID does not exist');
                return res.end();
            }
            // Adding new data to courses object 
            console.log(courseID);
            const newCourses = courses.filter(course => course.id != parsedData.id)

            // Writing to a file 
            fs.writeFileSync("./courses.json", JSON.stringify(newCourses));
            res.write("Course deleted successfully");
            res.end();
        })
    }

    // update course by ID
    else if (req.url == '/updateCourse' && req.method == 'PUT') {
        // receive data
        let parsedData = '';
        req.on('data', (chunk) => {
            console.log('Data received');
            parsedData = JSON.parse(chunk)
        })
        req.on('end', () => {
            // Reading JSON file 
            const courses = JSON.parse(fs.readFileSync("./courses.json", "utf8") || "[]");

            const courseIdExist = courses.find(course => course.id == parsedData.id);
            if (!courseIdExist) {
                res.write('That ID does not exist');
                return res.end();
            }

            const courseIndex = courses.findIndex(course => course.id == parsedData.id);
            const newCourses = courses.with(courseIndex, parsedData)

            // Writing to a file 
            fs.writeFileSync("./courses.json", JSON.stringify(newCourses));
            res.write("Course updated successfully");
            res.end();
        })
    }

    // Search for a course by ID
    else if (req.url == '/searchCourseId' && req.method == 'GET') {
        // receive data
        let parsedData = '';
        req.on('data', (chunk) => {
            console.log('Data received');
            parsedData = JSON.parse(chunk)
        })
        req.on('end', () => {
            // Reading JSON file 
            const courses = JSON.parse(fs.readFileSync("./courses.json", "utf8") || "[]");

            const courseID = courses.find(course => course.id == parsedData.id);
            if (!courseID) {
                res.write('That ID does not exist');
                return res.end();
            }
            res.write(JSON.stringify(courseID));
            res.end();
        })
    }

    // Sort courses
    else if (req.url == '/sortCourses' && req.method == 'GET') {
        // Reading JSON file 
        const courses = JSON.parse(fs.readFileSync("./courses.json", "utf8") || "[]");
        courses.sort(compare);

        function compare(a, b) {
            if (a.id < b.id) {
                return -1;
            }
            if (a.id > b.id) {
                return 1;
            }
            return 0;
        }

        // Writing to a file 
        fs.writeFileSync("./courses.json", JSON.stringify(courses));

        res.write("Courses sorted successfully");
        res.end();
    }
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////  DEPARTMENT API  ////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Add department(email must be unique)
    else if (req.url == '/addDepartment' && req.method == 'POST') {
        // receive data
        let parsedData = '';
        req.on('data', (chunk) => {
            console.log('Data received');
            parsedData = JSON.parse(chunk)
        })
        req.on('end', () => {
            // Reading JSON file 
            const departments = JSON.parse(fs.readFileSync("./departments.json", "utf8") || "[]");

            // Check department name
            const isDepartmentExist = departments.find(department => department.name == parsedData.name);
            if (isDepartmentExist) {
                res.write('department already exist');
                return res.end();
            }
            // Adding new data to departments object 
            departments.push(parsedData);

            // Writing to a file 
            fs.writeFileSync("./departments.json", JSON.stringify(departments));
            res.write("Department added successfully");
            res.end();
        })
    }

    // Get all departments
    else if (req.url == '/getAllDepartments' && req.method == 'GET') {
        // Reading JSON file 
        const departments = JSON.parse(fs.readFileSync("./departments.json", "utf8") || "[]");
        res.write(JSON.stringify(departments));
        res.end();
    }

    // Delete department by ID
    else if (req.url == '/deleteDepartment' && req.method == 'DELETE') {
        // receive data
        let parsedData = '';
        req.on('data', (chunk) => {
            console.log('Data received');
            parsedData = JSON.parse(chunk)
        })
        req.on('end', () => {
            // Reading JSON file 
            const departments = JSON.parse(fs.readFileSync("./departments.json", "utf8") || "[]");

            const departmentID = departments.find(department => department.id == parsedData.id);
            if (!departmentID) {
                res.write('That ID does not exist');
                return res.end();
            }
            // Adding new data to departments object 
            console.log(departmentID);
            const newDepartments = departments.filter(department => department.id != parsedData.id)

            // Writing to a file 
            fs.writeFileSync("./departments.json", JSON.stringify(newDepartments));
            res.write("Department deleted successfully");
            res.end();
        })
    }

    // update department by ID
    else if (req.url == '/updateDepartment' && req.method == 'PUT') {
        // receive data
        let parsedData = '';
        req.on('data', (chunk) => {
            console.log('Data received');
            parsedData = JSON.parse(chunk)
        })
        req.on('end', () => {
            // Reading JSON file 
            const departments = JSON.parse(fs.readFileSync("./departments.json", "utf8") || "[]");

            const departmentIdExist = departments.find(department => department.id == parsedData.id);
            if (!departmentIdExist) {
                res.write('That ID does not exist');
                return res.end();
            }

            const departmentIndex = departments.findIndex(department => department.id == parsedData.id);
            const newDepartments = departments.with(departmentIndex, parsedData)

            // Writing to a file 
            fs.writeFileSync("./departments.json", JSON.stringify(newDepartments));
            res.write("department updated successfully");
            res.end();
        })
    }

    // Search for a department by ID
    else if (req.url == '/searchDepartmentId' && req.method == 'GET') {
        // receive data
        let parsedData = '';
        req.on('data', (chunk) => {
            console.log('Data received');
            parsedData = JSON.parse(chunk)
        })
        req.on('end', () => {
            // Reading JSON file 
            const departments = JSON.parse(fs.readFileSync("./departments.json", "utf8") || "[]");

            const departmentID = departments.find(department => department.id == parsedData.id);
            if (!departmentID) {
                res.write('That ID does not exist');
                return res.end();
            }
            res.write(JSON.stringify(departmentID));
            res.end();
        })
    }

    // Sort departments
    else if (req.url == '/sortDepartments' && req.method == 'GET') {
        // Reading JSON file 
        const departments = JSON.parse(fs.readFileSync("./departments.json", "utf8") || "[]");
        departments.sort(compare);

        function compare(a, b) {
            if (a.id < b.id) {
                return -1;
            }
            if (a.id > b.id) {
                return 1;
            }
            return 0;
        }

        // Writing to a file 
        fs.writeFileSync("./departments.json", JSON.stringify(departments));

        res.write("Departments sorted successfully");
        res.end();
    }
    else
        console.log("Page Not Found");

}).listen(3000, () => console.log("server is running on port:3000"))