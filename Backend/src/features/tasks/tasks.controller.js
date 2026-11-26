import * as service from "./tasks.service.js";

export function list(_req, res) {
  res.json(service.list());
}

export function create(req, res) {
  res.status(201).json(service.create(req.body));
}

export function update(req, res) {
  res.json(service.update(req.params.id, req.body));
}

export function remove(req, res) {
  service.remove(req.params.id);
  res.status(204).end();
}
