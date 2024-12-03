import { Request, Response } from "express";
import { Model } from "mongoose";

class BaseController<T> {
  model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async getAllObjects(req: Request, res: Response) {
    const filter = req.query;
    try {
        const posts = await this.model.find(filter as Partial<T>);
        res.status(200).send(posts);
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  };

  async getObjectById(req: Request, res: Response) {
    const id = req.params.id;

    try {
      const post = await this.model.findById(id);
      if (post === null)
        res.status(404).send(" not found");
      else
        res.status(200).send(post);
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  };

  async createObject(req: Request, res: Response) {
    console.log(req.body);
    try {
      const post = await this.model.create(req.body);
      res.status(201).send(post);
    } catch (err) {
      console.error('Error creating object:', err);
      res.status(400).send(err);
    }
  };

  async deleteObject(req: Request, res: Response) {
    const id = req.params.id;
    try {
      const post = await this.model.deleteOne({ _id: id });
      if (post.deletedCount === 0)
        res.status(404).send(" not found");
      else
        res.status(201).send(post);
    } catch (err) {
      res.status(400);
      res.send(err);
    }
  }
}
const createController = <T>(model: Model<T>) => {
  return new BaseController(model);
}
export default  createController;