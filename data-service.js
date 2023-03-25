const Sequelize = require("sequelize");

var sequelize = new Sequelize(
  "vzyfwzvz",
  "vzyfwzvz",
  "viTSamY1QIFRxW_qM79ksU8DWCODHAUw",
  {
    host: "isilo.db.elephantsql.com",
    dialect: "postgres",
    port: 5432,
    dialectOptions: {
      ssl: { rejectUnauthorixed: false },
    },
    query: { raw: true },
  }
);

const Student = sequelize.define("student", {
  studentID: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  firstName: Sequelize.STRING,
  lastName: Sequelize.STRING,
  email: Sequelize.STRING,
  phone: Sequelize.STRING,
  addressStreet: Sequelize.STRING,
  addressCity: Sequelize.STRING,
  addressState: Sequelize.STRING,
  addressPostal: Sequelize.STRING,
  isInternationalStudent: Sequelize.BOOLEAN,
  expectedCredential: Sequelize.STRING,
  status: Sequelize.STRING,
  registrationDate: Sequelize.STRING,
});

const Image = sequelize.define("image", {
  imageID: {
    type: Sequelize.STRING,
    primaryKey: true,
  },
  imageUrl: Sequelize.STRING,
  version: Sequelize.INTEGER,
  width: Sequelize.INTEGER,
  height: Sequelize.INTEGER,
  format: Sequelize.STRING,
  resourceType: Sequelize.STRING,
  uploadedAt: Sequelize.DATE,
  originalFileName: Sequelize.STRING,
  mimeType: Sequelize.STRING,
});

const Program = sequelize.define("program", {
  programCode: {
    type: Sequelize.STRING,
    primaryKey: true,
  },
  programName: { type: Sequelize.STRING },
});

Program.hasMany(Student, { foreignKey: "program" });

function initialize() {
  return new Promise((resolve, reject) => {
    sequelize
      .sync()
      .then(() => {
        resolve("Database synced");
      })
      .catch((err) => {
        reject("Unable to sync the database");
      });
  });
}

function getAllStudents() {
  return new Promise((resolve, reject) => {
    Student.findAll()
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        reject("no results returned");
      });
  });
}

function getStudentsByStatus(status) {
  return new Promise((resolve, reject) => {
    Student.findAll({
      where: {
        status: status,
      },
    })
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        reject("no results returned");
      });
  });
}

function getStudentsByProgramCode(program) {
  return new Promise((resolve, reject) => {
    Student.findAll({ where: { program: program } })
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        reject("no results returned");
      });
  });
}

function getStudentsByExpectedCredential(credential) {
  return new Promise((resolve, reject) => {
    Student.findAll({
      where: {
        expectedCredential: credential,
      },
    })
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        reject("no results returned");
      });
  });
}

function getStudentById(id) {
  return new Promise((resolve, reject) => {
    Student.findAll({
      where: {
        studentID: id,
      },
    })
      .then((data) => {
        if (data.length > 0) {
          resolve(data[0]);
        } else {
          reject("no results returned");
        }
      })
      .catch((err) => {
        reject("no results returned");
      });
  });
}

function getPrograms() {
  return new Promise((resolve, reject) => {
    Program.findAll()
      .then((programs) => {
        if (programs.length > 0) {
          resolve(programs);
        } else {
          reject("No results returned");
        }
      })
      .catch((error) => {
        reject("Error: " + error);
      });
  });
}

function addStudent(studentData) {
  studentData.isInternationalStudent = studentData.isInternationalStudent
    ? true
    : false;

  for (let prop in studentData) {
    if (studentData[prop] === "") {
      studentData[prop] = null;
    }
  }

  return new Promise((resolve, reject) => {
    Student.create(studentData)
      .then(() => resolve())
      .catch(() => reject("unable to create student"));
  });
}

function updateStudent(studentData) {
  studentData.isInternationalStudent = studentData.isInternationalStudent
    ? true
    : false;

  for (let prop in studentData) {
    if (studentData[prop] === "") {
      studentData[prop] = null;
    }
  }

  return new Promise((resolve, reject) => {
    Student.update(studentData, {
      where: {
        studentID: studentData.studentID,
      },
    })
      .then((result) => {
        if (result[0] === 0) {
          reject("no student updated");
        } else {
          resolve("student updated");
        }
      })
      .catch((err) => {
        reject("unable to update student");
      });
  });
}

function addImage(imageData) {
  return new Promise((resolve, reject) => {
    Image.create(imageData)
      .then(() => {
        resolve();
      })
      .catch(() => {
        reject("Unable to create image");
      });
  });
}

function getImages() {
  return new Promise((resolve, reject) => {
    Image.findAll()
      .then((data) => {
        resolve(data);
      })
      .catch(() => {
        reject("no results returned");
      });
  });
}

function addProgram(programData) {
  for (let key in programData) {
    if (programData.hasOwnProperty(key) && programData[key] === "") {
      programData[key] = null;
    }
  }

  return new Promise((resolve, reject) => {
    Program.create(programData)
      .then((program) => {
        resolve(program);
      })
      .catch((err) => {
        reject("Unable to create program.");
      });
  });
}

function updateProgram(programData) {
  for (const key in programData) {
    if (programData.hasOwnProperty(key) && programData[key] === "") {
      programData[key] = null;
    }
  }

  return new Promise((resolve, reject) => {
    Program.update(programData, {
      where: { programCode: programData.programCode },
    })
      .then((result) => {
        if (result[0] === 0) {
          reject("Program not found");
        } else {
          resolve();
        }
      })
      .catch((error) => {
        reject("Unable to update program");
      });
  });
}

function getProgramByCode(pcode) {
  return new Promise((resolve, reject) => {
    Program.findAll({
      where: { programCode: pcode },
      limit: 1, // Only return the first result
    })
      .then((data) => {
        if (data.length > 0) {
          resolve(data[0]);
        } else {
          reject("No results returned");
        }
      })
      .catch((error) => {
        reject("Error retrieving program: " + error.message);
      });
  });
}

function deleteProgramByCode(pcode) {
  return new Promise((resolve, reject) => {
    Program.destroy({ where: { programCode: pcode } })
      .then((deletedRows) => {
        if (deletedRows > 0) {
          resolve("Program deleted successfully");
        } else {
          reject("Program not found");
        }
      })
      .catch((err) => {
        reject("Unable to delete program");
      });
  });
}

function deleteStudentById(studentId) {
  return new Promise((resolve, reject) => {
    Student.destroy({
      where: {
        studentID: studentId,
      },
    })
      .then((rowsDeleted) => {
        if (rowsDeleted == 0) {
          reject(new Error("Student not found"));
        } else {
          resolve();
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
}

module.exports = {
  initialize,
  getAllStudents,
  getPrograms,
  getImages,
  addImage,
  addStudent,
  getStudentsByStatus,
  getStudentsByProgramCode,
  getStudentsByExpectedCredential,
  getStudentById,
  updateStudent,
  addProgram,
  updateProgram,
  getProgramByCode,
  deleteProgramByCode,
  deleteStudentById,
};