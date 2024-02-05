import express from "express";
import { prisma } from "../prisma/prisma-instance";
import { errorHandleMiddleware } from "./error-handler";
import "express-async-errors";

const app = express();
app.use(express.json());
// All code should go below this line
app.get("/", (_req, res) => {
  res.json({ message: "Hello World!" }).status(200);
});

//Index endpoint
app.get("/dogs", async (_req, res) => {
  try {
    const allDogs = await prisma.dog.findMany();
    return res.status(200).send(allDogs);
  } catch (e) {
    console.error(e);
    res.status(404).send({ error: "No content" });
  }
});

//Show endpoint
app.get("/dogs/:id", async (_req, res) => {
  const id = +_req.params.id;
  if (!id) {
    return res
      .status(400)
      .send({ message: "id should be a number" });
  }
  const dog = await prisma.dog.findUnique({
    where: {
      id,
    },
  });
  if (dog === null) {
    res.status(204).send({ error: "No content" });
  }
  return res.status(200).send(dog);
});

//Create endpoint
app.post("/dogs", (_req, res) => {
  const body = _req.body;
  const { name, breed, description, age } = body;
  const bodyKeys = Object.keys(body);
  const errors: string[] = [];
  const keys = ["name", "breed", "description", "age"];

  bodyKeys.forEach((key) => {
    if (!keys.includes(key))
      errors.push(`'${key}' is not a valid key`);
  });
  if (errors.length > 0) {
    return res.status(400).send({ errors });
  }
  if (typeof name !== "string") {
    errors.push("name should be a string");
  }
  if (typeof breed !== "string") {
    errors.push("breed should be a string");
  }
  if (typeof description !== "string") {
    errors.push("description should be a string");
  }
  if (typeof age !== "number") {
    errors.push("age should be a number");
  }
  if (errors.length > 0) {
    return res.status(400).send({ errors });
  }
  return prisma.dog
    .create({
      data: {
        name: name,
        breed: breed,
        description: description,
        age: age,
      },
    })
    .then((dog) => res.status(201).send(dog))
    .catch((e) => {
      console.error(e);
      res.status(500);
    });
});

//Update endpoint
app.patch("/dogs/:id", async (_req, res) => {
  const id = +_req.params.id;
  const dataInput = _req.body;
  const keys = ["name", "breed", "description", "age"];
  const keysInput = Object.keys(dataInput);
  const entries = Object.entries(dataInput);
  const errors: string[] = [];

  if (!id) {
    return res
      .status(400)
      .send({ message: "id should be a number" });
  }
  keysInput.forEach((key) => {
    if (!keys.includes(key))
      errors.push(`'${key}' is not a valid key`);
  });
  entries.forEach((entry) => {
    const key = entry[0];
    const value = entry[1];
    if (key === "name" && typeof value !== "string") {
      errors.push("name should be a string");
    }
    if (key === "breed" && typeof value !== "string") {
      errors.push("breed should be a string");
    }
    if (
      key === "description" &&
      typeof value !== "string"
    ) {
      errors.push("description should be a string");
    }
    if (key === "age" && typeof value !== "number") {
      errors.push("age should be a number");
    }
  });
  if (errors.length > 0) {
    return res.status(400).send({ errors });
  }

  const updated = await prisma.dog
    .update({
      where: {
        id,
      },
      data: dataInput,
    })
    .catch(() => null);

  if (updated === null) {
    return res.status(204).send({ error: "No content" });
  }
  return res.status(201).send(updated);
});

//Delete endpoint
app.delete("/dogs/:id", async (_req, res) => {
  const id = +_req.params.id;
  if (!id) {
    return res
      .status(400)
      .send({ message: "id should be a number" });
  }
  const deleted = await prisma.dog
    .delete({
      where: {
        id,
      },
    })
    .catch(() => null);

  if (deleted === null) {
    return res.status(204).send({ error: "No content" });
  }
  return res.status(200).send(deleted);
});

// all your code should go above this line
app.use(errorHandleMiddleware);

const port = process.env.NODE_ENV === "test" ? 3001 : 3000;
app.listen(port, () =>
  console.log(`
🚀 Server ready at: http://localhost:${port}
`)
);
