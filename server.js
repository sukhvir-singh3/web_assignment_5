/*********************************************************************************
 * WEB322 – Assignment 04
 * I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
 * of this assignment has been copied manually or electronically from any other source
 * (including 3rd party web sites) or distributed to other students.
 *
 * Name:Sukhvir Singh
 * Student ID:155312218
 * Date: 14 Mar
 *
 * Online (Cyclic) Link: https://zany-ruby-calf-hose.cyclic.app/
 *
 ********************************************************************************/
const express = require("express");
const path = require("path");
const dataService = require("./data-service.js");
const app = express();
const port = process.env.PORT || 8080;
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const upload = multer(); // no { storage: storage } since we are not using disk storage
const exphbs = require("express-handlebars");

cloudinary.config({
  cloud_name: "dtf5zy9qs",
  api_key: "922491893169912",
  api_secret: "YhllB98btNrnK45ea5F6DIg4k0E",
  secure: true,
});

app.engine(
  "hbs",
  exphbs.engine({
    extname: ".hbs",
    defaultLayout: "main",
    helpers: {
      navLink: function (url, options) {
        return (
          "<li" +
          (url == app.locals.activeRoute ? ' class="active" ' : "") +
          '><a href="' +
          url +
          '">' +
          options.fn(this) +
          "</a></li>"
        );
      },
      equals: function (lvalue, rvalue, options) {
        if (arguments.length < 3)
          throw new Error("Handlebars Helper equal needs 2 parameters");
        if (lvalue != rvalue) {
          return options.inverse(this);
        } else {
          return options.fn(this);
        }
      },
    },
  })
);

app.set("view engine", "hbs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

app.use(function (req, res, next) {
  let route = req.baseUrl + req.path;
  app.locals.activeRoute = route == "/" ? "/" : route.replace(/\/$/, "");
  next();
});

app.get("/", (req, res) => {
  res.render(path.join(__dirname, "/views/home.hbs"));
});

app.get("/about", (req, res) => {
  res.render(path.join(__dirname, "/views/about.hbs"));
});

app.get("/students", (req, res) => {
  if (req.query.status) {
    dataService
      .getStudentsByStatus(req.query.status)
      .then((students) => {
        console.log(students);
        if (students.length > 0) {
          res.render("students", { students: students });
        } else {
          res.render("students", { message: "no results" });
        }
      })
      .catch((err) => {
        res.render("students", { message: "no results" });
      });
  } else if (req.query.program) {
    dataService
      .getStudentsByProgramCode(req.query.program)
      .then((students) => {
        if (students.length > 0) {
          res.render("students", { students: students });
        } else {
          res.render("students", { message: "no results" });
        }
      })
      .catch((err) => {
        res.render("students", { message: "no results" });
      });
  } else if (req.query.credential) {
    dataService
      .getStudentsByExpectedCredential(req.query.credential)
      .then((students) => {
        if (students.length > 0) {
          res.render("students", { students: students });
        } else {
          res.render("students", { message: "no results" });
        }
      })
      .catch((err) => {
        res.render("students", { message: "no results" });
      });
  } else {
    dataService
      .getAllStudents()
      .then((students) => {
        console.log(students);
        if (students.length > 0) {
          res.render("students", { students: students });
        } else {
          res.render("students", { message: "no results" });
        }
      })
      .catch((err) => {
        res.render("students", { message: "no results" });
      });
  }
});

app.post("/student/update", (req, res) => {
  console.log(req.body);
  res.redirect("/students");
});

app.get("/student/:studentId", (req, res) => {
  // initialize an empty object to store the values
  let viewData = {};

  dataService
    .getStudentById(req.params.studentId)
    .then((data) => {
      if (data) {
        viewData.student = data; //store student data in the "viewData" object as "student"
      } else {
        viewData.student = null; // set student to null if none were returned
      }
    })
    .catch(() => {
      viewData.student = null; // set student to null if there was an error
    })
    .then(dataService.getPrograms)
    .then((data) => {
      viewData.programs = data; // store program data in the "viewData" object as "programs"

      // loop through viewData.programs and once we have found the programCode that matches
      // the student's "program" value, add a "selected" property to the matching
      // viewData.programs object

      for (let i = 0; i < viewData.programs.length; i++) {
        if (viewData.programs[i].programCode == viewData.student.program) {
          viewData.programs[i].selected = true;
        }
      }
    })
    .catch(() => {
      viewData.programs = []; // set programs to empty if there was an error
    })
    .then(() => {
      if (viewData.student == null) {
        // if no student - return an error
        res.status(404).send("Student Not Found");
      } else {
        res.render("student", { viewData: viewData }); // render the "student" view
      }
    })
    .catch((err) => {
      res.status(500).send("Unable to Show Students");
    });
});
app.get("/intlstudents", (req, res) => {
  dataService
    .getInternationalStudents()
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.json({ message: err });
    });
});

app.get("/programs", (req, res) => {
  dataService
    .getPrograms()
    .then((data) => {
      if (data.length > 0) {
        console.log(data);
        res.render("programs", { data });
      } else {
        res.render("programs", { message: "no results" });
      }
    })
    .catch((err) => {
      res.render("programs", { message: "no results" });
    });
});

app.get("/students/add", (req, res) => {
  dataService
    .getPrograms()
    .then((programs) => {
      console.log(programs);
      res.render("addStudent", { programs });
    })
    .catch((err) => {
      console.log(`Error retrieving programs: ${err}`);
      res.render("addStudent.hbs", { programs: [] });
    });
});

app.post("/students/add", (req, res) => {
  dataService
    .addStudent(req.body)
    .then(() => {
      res.redirect("/students");
    })
    .catch((err) => {
      res.status(500).json({ message: err });
    });
});

app.get("/images/add", (req, res) => {
  res.render(path.join(__dirname, "/views/addImage.hbs"));
});

app.post("/images/add", upload.single("imageFile"), (req, res) => {
  if (req.file) {
    let streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream((error, result) => {
          if (result) {
            resolve(result);
          } else {
            reject(error);
          }
        });

        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    async function upload(req) {
      let result = await streamUpload(req);
      console.log(result);
      return result;
    }

    upload(req).then((uploaded) => {
      processForm(uploaded);
    });
  } else {
    processForm("");
  }

  function processForm(uploaded) {
    let imageData = {};
    imageData.imageID = uploaded.public_id;
    imageData.imageUrl = uploaded.secure_url;
    imageData.version = uploaded.version;
    imageData.width = uploaded.width;
    imageData.height = uploaded.height;
    imageData.format = uploaded.format;
    imageData.resourceType = uploaded.resource_type;
    imageData.uploadedAt = uploaded.created_at;
    imageData.originalFileName = req.file.originalname;
    imageData.mimeType = req.file.mimetype;

    dataService
      .addImage(imageData)
      .then(() => {
        res.redirect("/images");
      })
      .catch((err) => {
        console.log(err);
        res.redirect("/images");
      });
  }
});

app.get("/images", (req, res) => {
  dataService
    .getImages()
    .then((images) => {
      if (images.length > 0) {
        res.render("images", { images });
      } else {
        res.render("images", { message: "No results" });
      }
    })
    .catch((err) => {
      res.status(500).send("Unable to get images");
    });
});

app.get("/programs/add", (req, res) => {
  res.render(path.join(__dirname, "/views/addProgram"));
});

app.post("/programs/add", function (req, res) {
  dataService
    .addProgram(req.body)
    .then(() => {
      res.redirect("/programs");
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Unable to add program");
    });
});

app.post("/program/update", (req, res) => {
  dataService
    .updateProgram(req.body)
    .then(() => {
      res.redirect("/programs");
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Unable to update program");
    });
});

app.get("/program/:programCode", function (req, res) {
  dataService
    .getProgramByCode(req.params.programCode)
    .then(function (data) {
      if (data) {
        res.render("program", { data });
      } else {
        res.status(404).send("Program Not Found");
      }
    })
    .catch(function (err) {
      res.status(404).send("Program Not Found");
    });
});

app.get("/programs/delete/:programCode", function (req, res) {
  var pcode = req.params.programCode;
  dataService
    .deleteProgramByCode(pcode)
    .then(function () {
      res.redirect("/programs");
    })
    .catch(function () {
      res.status(500).send("Unable to Remove Program / Program not found");
    });
});

app.get("/students/delete/:studentID", (req, res) => {
  var studentId = req.params.studentID;
  dataService
    .deleteStudentById(studentId)
    .then(() => {
      res.redirect("/students");
    })
    .catch((err) => {
      res.status(500).send("Unable to Remove Student / Student not found");
    });
});

app.use((req, res) => {
  res.status(404).send("Page Not Found");
});

dataService
  .initialize()
  .then(() => {
    app.listen(port, () => {
      console.log("Server is listening on port: " + port);
    });
  })
  .catch((err) => {
    console.error("Error initializing data: " + err);
  });