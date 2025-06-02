import mongoose from "mongoose";

const competitionSchema = new mongoose.Schema({
    title: { 
        type: String,
        required: true,
        trim: true
    },
    organiser: {
        type: String,
        required: true,
        trim: true
    },
    mode: {
        type: String,
        enum: ['online', 'offline', 'hybrid'],
        default: 'online',
        required: true
    },
    location: {
        type: String,
        trim: true
    },
    prize: {
        type: String,
        default: 'Non cash prize',
        trim: true
    },
    daysLeft: {
        type: String,
        required: true,
        trim: true
    },
    link: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        validate: {
            validator: function(v) {
                return /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(v);
            },
            message: props => `${props.value} is not a valid URL!`
        }
    }
}, {
    timestamps: true 
});


competitionSchema.index({ title: 'text', organiser: 'text', mode: 1 });

const Competition = mongoose.model('Competition', competitionSchema);

export default Competition;