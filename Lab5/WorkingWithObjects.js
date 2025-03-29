const assignment = {
    id: 1, title: "NodeJS Assignment",
    description: "Create a NodeJS server with ExpressJS",
    due: "2021-10-10", completed: false, score: 0,
};

const module = {
    id: "123",
    name: "Web",
    description: "Web",
    course: "Web"
  };

export default function WorkingWithObjects(app) {
  app.get("/lab5/assignment", (req, res) => {
    res.json(assignment);
  });
  app.get("/lab5/assignment/title", (req, res) => {
    res.json(assignment.title);
  });
  app.get("/lab5/module", (req, res) => {
    res.json(module);
  }); 
  app.get("/lab5/module/name", (req, res) => {
    res.json(module.name);
  });


};
