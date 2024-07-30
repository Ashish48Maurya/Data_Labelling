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
    }]
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
    image_url: [{
        url: {
            type: String,
            required: true
        },
        noOfClick: {
            type: Number,
            default: 0,
        }
    }],
    amount: {
        type: mongoose.Schema.Types.Decimal128,
        default: mongoose.Types.Decimal128.fromString('0'),
    },
    signature: {
        type: String,
        required: true,
        default: "null"
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
    },
    workers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "worker"
    }]
});

const SubmissionSchema = new mongoose.Schema({
    task: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "task",
    },
    selectedOption: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    worker: {  // Ensure only one submission per task per worker
        type: mongoose.Schema.Types.ObjectId,
        ref: "worker"
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
        enum: ["processing", "success", "failed"],
        default: "processing",
    }
});

export const User = mongoose.models.user || mongoose.model("user", UserSchema);
export const Worker = mongoose.models.worker || mongoose.model("worker", WorkerSchema);
export const Task = mongoose.models.task || mongoose.model("task", TaskSchema);
export const Submission = mongoose.models.submission || mongoose.model("submission", SubmissionSchema);
export const PayOut = mongoose.models.PayOut || mongoose.model("PayOut", PayOutSchema);
