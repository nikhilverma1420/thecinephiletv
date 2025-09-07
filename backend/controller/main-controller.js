const User = require('../models/User');
const Post = require('../models/Post');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs');

const home = async (req, res) => {
    try {
        res.send("Backend is running! with the help of router -> controller");
    } catch (error) {
        console.log(error);
    }
}

const registration = async (req, res) => {
    try {
        const { name, email, password, confirmPassword } = req.body;

        // Validation
        if (!name || !email || !password || !confirmPassword) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create new user
        const user = new User({
            name,
            email,
            password: hashedPassword
        });

        await user.save();

        res.status(201).json({ 
            message: 'User created successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error during registration' });
    }
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        res.status(200).json({ 
            message: 'Login successful',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error during login' });
    }
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB limit
    },
    fileFilter: function (req, file, cb) {
        // Accept video and image files
        const videoTypes = /mp4|avi|mov|wmv|flv|webm|mkv/;
        const imageTypes = /jpg|jpeg|png|gif|webp/;
        const extname = path.extname(file.originalname).toLowerCase();
        const isVideo = file.mimetype.startsWith('video/') && videoTypes.test(extname);
        const isImage = file.mimetype.startsWith('image/') && imageTypes.test(extname);

        if (isVideo || isImage) {
            return cb(null, true);
        } else {
            cb(new Error('Only video and image files are allowed!'));
        }
    }
});

// Function to resize image to A4 size
const resizeToA4 = async (inputPath, outputPath) => {
    try {
        // A4 size: 595x842 pixels (72 DPI) or 2480x3508 pixels (300 DPI)
        // Using 595x842 for web display
        const A4_WIDTH = 595;
        const A4_HEIGHT = 842;
        
        await sharp(inputPath)
            .resize(A4_WIDTH, A4_HEIGHT, {
                fit: 'contain',
                background: { r: 255, g: 255, b: 255, alpha: 1 } // White background
            })
            .jpeg({ quality: 90 })
            .toFile(outputPath);
        
        return true;
    } catch (error) {
        console.error('Error resizing image:', error);
        return false;
    }
};

const uploadPost = async (req, res) => {
    try {
        const { title, cast, quality, description, downloadLink, photoLink, email } = req.body;
        
        // Validation
        if (!title || !title.trim()) {
            return res.status(400).json({ message: 'Title is required' });
        }

        if (!req.files || !req.files.thumbnail) {
            return res.status(400).json({ message: 'Thumbnail file is required' });
        }

        // Find or create the admin user
        let adminUser = await User.findOne({ email });
        if (!adminUser) {
            // Create a default admin user if it doesn't exist
            const hashedPassword = await bcrypt.hash('defaultpassword', 10);
            adminUser = new User({
                name: 'Admin User',
                email: email,
                password: hashedPassword,
                role: 'admin'
            });
            await adminUser.save();
        }

        // Prepare file data
        const thumbnailFile = req.files.thumbnail[0];
        const videoFile = req.files.video ? req.files.video[0] : null;
        const photoFile = req.files.photo ? req.files.photo[0] : null;

        // Resize thumbnail to A4 size
        const originalThumbnailPath = thumbnailFile.path;
        const resizedThumbnailPath = originalThumbnailPath.replace(path.extname(originalThumbnailPath), '_a4.jpg');
        
        const resizeSuccess = await resizeToA4(originalThumbnailPath, resizedThumbnailPath);
        
        if (!resizeSuccess) {
            return res.status(500).json({ message: 'Error processing thumbnail image' });
        }

        // Delete original thumbnail file and use resized version
        fs.unlinkSync(originalThumbnailPath);
        
        // Update thumbnail file info
        const resizedThumbnailStats = fs.statSync(resizedThumbnailPath);
        const resizedThumbnailFilename = path.basename(resizedThumbnailPath);

        // Create post data
        const postData = {
            title: title.trim(),
            cast: cast ? cast.trim() : '',
            quality: quality ? quality.trim() : '',
            description: description ? description.trim() : '',
            downloadLink: downloadLink ? downloadLink.trim() : '',
            photoLink: photoLink ? photoLink.trim() : '',
            thumbnail: {
                filename: resizedThumbnailFilename,
                originalName: thumbnailFile.originalname,
                size: resizedThumbnailStats.size,
                path: resizedThumbnailPath
            },
            uploadedBy: adminUser._id
        };

        // Add video if provided
        if (videoFile) {
            postData.video = {
                filename: videoFile.filename,
                originalName: videoFile.originalname,
                size: videoFile.size,
                path: videoFile.path
            };
        }

        // Add photo if provided (also resize to A4)
        if (photoFile) {
            const originalPhotoPath = photoFile.path;
            const resizedPhotoPath = originalPhotoPath.replace(path.extname(originalPhotoPath), '_a4.jpg');
            
            const photoResizeSuccess = await resizeToA4(originalPhotoPath, resizedPhotoPath);
            
            if (photoResizeSuccess) {
                // Delete original photo file and use resized version
                fs.unlinkSync(originalPhotoPath);
                
                const resizedPhotoStats = fs.statSync(resizedPhotoPath);
                const resizedPhotoFilename = path.basename(resizedPhotoPath);
                
                postData.photo = {
                    filename: resizedPhotoFilename,
                    originalName: photoFile.originalname,
                    size: resizedPhotoStats.size,
                    path: resizedPhotoPath
                };
            } else {
                // If resize fails, use original photo
                postData.photo = {
                    filename: photoFile.filename,
                    originalName: photoFile.originalname,
                    size: photoFile.size,
                    path: photoFile.path
                };
            }
        }

        // Save post to database
        const post = new Post(postData);
        await post.save();

        res.status(200).json({
            message: 'Post uploaded successfully',
            post: {
                id: post._id,
                title: post.title,
                thumbnail: post.thumbnail ? `/uploads/${post.thumbnail.filename}` : null
            }
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Error uploading post' });
    }
};

const getAllUsers = async (req, res) => {
    try {
        console.log('getAllUsers called with user:', req.user);
        console.log('Request query:', req.query);
        
        // Get all users, excluding password field
        const users = await User.find({}, { password: 0 }).sort({ createdAt: -1 });
        
        console.log('Found users:', users.length);
        
        res.status(200).json({
            message: 'Users fetched successfully',
            users: users
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Server error while fetching users' });
    }
};

const getAllPosts = async (req, res) => {
    try {
        // Get all posts with populated user data
        const posts = await Post.find()
            .populate('uploadedBy', 'name email')
            .sort({ createdAt: -1 });
        
        // Format posts for frontend
        const formattedPosts = posts.map(post => ({
            id: post._id,
            title: post.title,
            cast: post.cast,
            quality: post.quality,
            description: post.description,
            downloadLink: post.downloadLink,
            photoLink: post.photoLink,
            thumbnail: post.thumbnail ? `/uploads/${post.thumbnail.filename}` : null,
            photo: post.photo ? `/uploads/${post.photo.filename}` : null,
            video: post.video ? `/uploads/${post.video.filename}` : null,
            uploadedBy: post.uploadedBy,
            createdAt: post.createdAt
        }));
        
        res.status(200).json({
            message: 'Posts fetched successfully',
            posts: formattedPosts
        });
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ message: 'Server error while fetching posts' });
    }
};

const clearAllPosts = async (req, res) => {
    try {
        // Get all posts to delete their files
        const posts = await Post.find();
        
        // Delete all uploaded files
        posts.forEach(post => {
            try {
                if (post.thumbnail && post.thumbnail.path) {
                    fs.unlinkSync(post.thumbnail.path);
                }
                if (post.photo && post.photo.path) {
                    fs.unlinkSync(post.photo.path);
                }
                if (post.video && post.video.path) {
                    fs.unlinkSync(post.video.path);
                }
            } catch (fileError) {
                console.error('Error deleting file:', fileError);
            }
        });
        
        // Delete all posts from database
        await Post.deleteMany({});
        
        res.status(200).json({
            message: 'All posts cleared successfully',
            deletedCount: posts.length
        });
    } catch (error) {
        console.error('Error clearing posts:', error);
        res.status(500).json({ message: 'Server error while clearing posts' });
    }
};

const createSamplePosts = async (req, res) => {
    try {
        // Find or create admin user
        let adminUser = await User.findOne({ email: 'cornhub1420@gmail.com' });
        if (!adminUser) {
            const hashedPassword = await bcrypt.hash('defaultpassword', 10);
            adminUser = new User({
                name: 'Admin User',
                email: 'cornhub1420@gmail.com',
                password: hashedPassword,
                role: 'admin'
            });
            await adminUser.save();
        }

        const samplePosts = [
            {
                title: "The Dark Knight Rises",
                cast: "Christian Bale, Tom Hardy, Anne Hathaway, Michael Caine",
                quality: "1080p",
                description: "Eight years after the Joker's reign of anarchy, Batman, with the help of the enigmatic Catwoman, is forced from his exile to save Gotham City from the brutal guerrilla terrorist Bane.",
                downloadLink: "https://example.com/download1",
                photoLink: "https://picsum.photos/400/600?random=1",
                uploadedBy: adminUser._id
            },
            {
                title: "Inception",
                cast: "Leonardo DiCaprio, Marion Cotillard, Tom Hardy, Joseph Gordon-Levitt",
                quality: "4K",
                description: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
                downloadLink: "https://example.com/download2",
                photoLink: "https://picsum.photos/400/600?random=2",
                uploadedBy: adminUser._id
            },
            {
                title: "Interstellar",
                cast: "Matthew McConaughey, Anne Hathaway, Jessica Chastain, Michael Caine",
                quality: "1080p",
                description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
                downloadLink: "https://example.com/download3",
                photoLink: "https://picsum.photos/400/600?random=3",
                uploadedBy: adminUser._id
            },
            {
                title: "The Matrix",
                cast: "Keanu Reeves, Laurence Fishburne, Carrie-Anne Moss, Hugo Weaving",
                quality: "720p",
                description: "A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.",
                downloadLink: "https://example.com/download4",
                photoLink: "https://picsum.photos/400/600?random=2",
                uploadedBy: adminUser._id
            },
            {
                title: "Blade Runner 2049",
                cast: "Ryan Gosling, Harrison Ford, Ana de Armas, Sylvia Hoeks",
                quality: "4K",
                description: "A young blade runner's discovery of a long-buried secret leads him to track down former blade runner Rick Deckard, who's been missing for thirty years.",
                downloadLink: "https://example.com/download5",
                photoLink: "https://picsum.photos/400/600?random=1",
                uploadedBy: adminUser._id
            },
            {
                title: "Mad Max: Fury Road",
                cast: "Tom Hardy, Charlize Theron, Nicholas Hoult, Hugh Keays-Byrne",
                quality: "1080p",
                description: "In a post-apocalyptic wasteland, Max teams up with a mysterious warrior to escape from a tyrannical warlord.",
                downloadLink: "https://example.com/download6",
                photoLink: "https://picsum.photos/400/600?random=3",
                uploadedBy: adminUser._id
            },
            {
                title: "Dune",
                cast: "Timothée Chalamet, Rebecca Ferguson, Oscar Isaac, Josh Brolin",
                quality: "4K",
                description: "Feature adaptation of Frank Herbert's science fiction novel about the son of a noble family entrusted with the protection of the most valuable asset in the galaxy.",
                downloadLink: "https://example.com/download7",
                photoLink: "https://picsum.photos/400/600?random=2",
                uploadedBy: adminUser._id
            },
            {
                title: "Tenet",
                cast: "John David Washington, Robert Pattinson, Elizabeth Debicki, Kenneth Branagh",
                quality: "1080p",
                description: "Armed with only one word, Tenet, and fighting for the survival of the entire world, a Protagonist journeys through a twilight world of international espionage.",
                downloadLink: "https://example.com/download8",
                photoLink: "https://picsum.photos/400/600?random=1",
                uploadedBy: adminUser._id
            },
            {
                title: "The Prestige",
                cast: "Christian Bale, Hugh Jackman, Scarlett Johansson, Michael Caine",
                quality: "720p",
                description: "After a tragic accident, two stage magicians engage in a battle to create the ultimate illusion while sacrificing everything they have to outwit each other.",
                downloadLink: "https://example.com/download9",
                photoLink: "https://picsum.photos/400/600?random=3",
                uploadedBy: adminUser._id
            },
            {
                title: "Arrival",
                cast: "Amy Adams, Jeremy Renner, Forest Whitaker, Michael Stuhlbarg",
                quality: "1080p",
                description: "A linguist is recruited by the military to communicate with alien lifeforms after twelve mysterious spacecraft appear around the world.",
                downloadLink: "https://example.com/download10",
                photoLink: "https://picsum.photos/400/600?random=2",
                uploadedBy: adminUser._id
            },
            {
                title: "Ex Machina",
                cast: "Domhnall Gleeson, Alicia Vikander, Oscar Isaac, Sonoya Mizuno",
                quality: "720p",
                description: "A young programmer is selected to participate in a ground-breaking experiment in synthetic intelligence by evaluating the human qualities of a breath-taking humanoid A.I.",
                downloadLink: "https://example.com/download11",
                photoLink: "https://picsum.photos/400/600?random=1",
                uploadedBy: adminUser._id
            },
            {
                title: "Her",
                cast: "Joaquin Phoenix, Amy Adams, Scarlett Johansson, Rooney Mara",
                quality: "1080p",
                description: "In a near future, a lonely writer develops an unlikely relationship with an operating system designed to meet his every need.",
                downloadLink: "https://example.com/download12",
                photoLink: "https://picsum.photos/400/600?random=3",
                uploadedBy: adminUser._id
            },
            {
                title: "Gravity",
                cast: "Sandra Bullock, George Clooney, Ed Harris, Orto Ignatiussen",
                quality: "4K",
                description: "Two astronauts work together to survive after an accident leaves them stranded in space.",
                downloadLink: "https://example.com/download13",
                photoLink: "https://picsum.photos/400/600?random=2",
                uploadedBy: adminUser._id
            },
            {
                title: "Edge of Tomorrow",
                cast: "Tom Cruise, Emily Blunt, Bill Paxton, Brendan Gleeson",
                quality: "1080p",
                description: "A soldier fighting aliens gets to relive the same day over and over again, the day restarting every time he dies.",
                downloadLink: "https://example.com/download14",
                photoLink: "https://picsum.photos/400/600?random=1",
                uploadedBy: adminUser._id
            },
            {
                title: "Annihilation",
                cast: "Natalie Portman, Jennifer Jason Leigh, Tessa Thompson, Oscar Isaac",
                quality: "720p",
                description: "A biologist signs up for a dangerous, secret expedition into a mysterious zone where the laws of nature don't apply.",
                downloadLink: "https://example.com/download15",
                photoLink: "https://picsum.photos/400/600?random=3",
                uploadedBy: adminUser._id
            }
        ];

        // Create posts
        const createdPosts = await Post.insertMany(samplePosts);
        
        res.status(200).json({
            message: 'Sample posts created successfully',
            count: createdPosts.length
        });
    } catch (error) {
        console.error('Error creating sample posts:', error);
        res.status(500).json({ message: 'Server error while creating sample posts' });
    }
};

module.exports = { home, registration, login, uploadPost, upload, getAllUsers, getAllPosts, clearAllPosts, createSamplePosts };