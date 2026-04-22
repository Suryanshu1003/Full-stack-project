const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { User, Task } = require('./models');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://127.0.0.1:27017/enterprise_os');

app.post('/api/login', async (req, res) => {
    try {
        const { email, pass } = req.body;
        const user = await User.findOne({ email, password: pass });
        if (user) {
            res.json({ success: true, user });
        } else {
            res.status(401).json({ success: false, message: "Invalid credentials" });
        }
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

app.get('/api/tasks', async (req, res) => {
    try {
        const { email, role } = req.query;
        let query = {};
        if (role !== 'Admin') {
            query = { assignedTo: email };
        }
        const tasks = await Task.find(query).sort({ deadline: 1 });
        res.json(tasks);
    } catch (err) {
        res.status(500).json(err);
    }
});

app.post('/api/tasks', async (req, res) => {
    try {
        const newTask = new Task(req.body);
        await newTask.save();
        res.json({ success: true, task: newTask });
    } catch (err) {
        res.status(400).json({ success: false });
    }
});

app.post('/api/ai/query', async (req, res) => {
    const { query, email, role } = req.body;
    let response = "System processing request";

    if (query.includes('deadline')) {
        let dbQuery = role === 'Admin' ? {} : { assignedTo: email };
        const nextTask = await Task.findOne(dbQuery).sort({ deadline: 1 });
        response = nextTask 
            ? `Next deadline is ${nextTask.deadline} for ${nextTask.title}`
            : "No deadlines found";
    } else if (query.includes('endpoint')) {
        response = "Endpoints are active at /api/v1/nexus";
    }

    res.json({ response });
});

const seedUsers = async () => {
    const count = await User.countDocuments();
    if (count === 0) {
        await User.insertMany([
            { name: "Yukti Sharma", email: "yukti@company.com", password: "123456", role: "User" },
            { name: "Manav Sharma", email: "manav@company.com", password: "123456", role: "User" },
            { name: "Ansh Kaushik", email: "ansh@company.com", password: "123456", role: "Admin" }
        ]);
    }
};
seedUsers();

app.listen(5000);