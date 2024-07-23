import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    address: {
        type: String,
        required: true
    },
    tasks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "task",
    }],
    payOuts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "payout",
    }],
    isVerified: {
        type: Boolean,
        required: true,
        default: false,
    }
});

const WorkerSchema = new mongoose.Schema({
    address: {
        type: String,
        required: true,
    },
    isVerified: {
        type: Boolean,
        required: true,
        default: false,
    },
    pending_amt: {
        type: mongoose.Schema.Types.Decimal128,
        default: mongoose.Types.Decimal128.fromString('0'),
    },
    locked_amt: {
        type: mongoose.Schema.Types.Decimal128,
        default: mongoose.Types.Decimal128.fromString('0'),
    },
    submissions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "submission",
    }]
});

const PaySlip = new mongoose.Schema({
    amount: {
        type: mongoose.Schema.Types.Decimal128,
        default: mongoose.Types.Decimal128.fromString('0'),
    },
    signature: {
        type: String,
        required: true,
        default: "null"
    }
})

const TaskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        default: "Select the one which you think is best"
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    image_url: [{ // just like options 1 2 3 4
        type: String,
        required: true
    }],
    paySlip:{
        type:mongoose.Schema.Types.ObjectId,
        ref: "paySlip",
    },
    noOfSuggestionsWant: {
        type: Number,
        default: 5
    },
    noOfClicks: {
        type: Number,
        default: 0,
    },
    isCompleted: {
        type: Boolean,
        default: false
    }
});

const SubmissionSchema = new mongoose.Schema({
    task: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "task",
    },
    selectedOption: {
        type: Number,
        default: 0,
        required: true,
    },
    worker: {  // Ensure only one submission per task per worker
        type: mongoose.Schema.Types.ObjectId,
        ref: "worker",
        unique: true
    }
});

const PayOutSchema = new mongoose.Schema({
    amount: {
        type: mongoose.Schema.Types.Decimal128,
        required: true,
    },
    worker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "worker",
    },
    signature: {
        type: String,
    },
    status: {
        type: String,
        enum: ["processing", "success", "failure"],
        default: "processing",
    }
});

mongoose.models = {};
export const User = mongoose.model("user", UserSchema);
export const Worker = mongoose.model("worker", WorkerSchema);
export const Task = mongoose.model("task", TaskSchema);
export const Submission = mongoose.model("submission", SubmissionSchema);
export const PayOut = mongoose.model("payout", PayOutSchema);
