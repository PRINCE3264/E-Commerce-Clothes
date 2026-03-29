const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Team = require('./models/Team');

dotenv.config();

const teamData = [
    {
        name: "PRINCE VIDYARTHI",
        role: "CEO & Founder",
        description: "15+ years in fashion retail, passionate about making quality clothing accessible.",
        image: "/image/IMG-20241224-WA0130.jpg",
        socials: {
            linkedin: "#",
            instagram: "#",
            twitter: "#"
        },
        displayOrder: 1
    },
    {
        name: "David Chen",
        role: "Head of Design",
        description: "Award-winning designer focused on creating timeless pieces that transcend seasons.",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        socials: {
            linkedin: "#",
            instagram: "#",
            twitter: "#"
        },
        displayOrder: 2
    },
    {
        name: "Sarah Miller",
        role: "Operations Director",
        description: "Ensuring smooth logistics and timely delivery to customers worldwide.",
        image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        socials: {
            linkedin: "#",
            instagram: "#",
            twitter: "#"
        },
        displayOrder: 3
    },
    {
        name: "Michael Brown",
        role: "Experience Lead",
        description: "Dedicated to ensuring every customer has an exceptional shopping experience.",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        socials: {
            linkedin: "#",
            instagram: "#",
            twitter: "#"
        },
        displayOrder: 4
    }
];

const seedTeam = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/PanditFashion');
        
        // Clear existing team members
        await Team.deleteMany();
        console.log('Team members cleared');

        // Insert new team members
        await Team.insertMany(teamData);
        console.log('Team members seeded successfully');

        process.exit();
    } catch (err) {
        console.error('Error seeding team:', err);
        process.exit(1);
    }
};

seedTeam();
