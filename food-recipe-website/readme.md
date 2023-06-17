# Food Recipe Website

## Introduction
This project is a food recipe website, which allows users to share and view food recipes. It is a full-stack web application developed using Node.js for the server-side, Express.js for the backend framework, MongoDB for the database, and EJS for templating. 

## Functionality and Usage Scenario
The food recipe website provides the following functionality:

1. **User Authentication:** Users can register and log in to the website. The authentication system is built using Passport.js and all the passwords are hashed using bcrypt before being stored in the database for security.

2. **Recipe Management:** Logged-in users can create, read, update, and delete their own recipes. Recipes are stored in a MongoDB database and are associated with the user who created them.

3. **Recipe Viewing:** All users can view recipes that have been marked as public by their creators. They can access these recipes on the public recipe page.

4. **Dashboard:** Logged-in users have a personal dashboard where they can view and manage their own recipes.

## Installation and Environment Configuration
To run the software from sources, follow the steps below:

### Prerequisites
Make sure you have the following installed on your system:
- Node.js and npm
- MongoDB

### Steps
1. **Clone the repository:** 
\```bash
git clone <repository_link>
\```

2. **Navigate into the project directory:** 
\```bash
cd food-recipe-website
\```

3. **Install dependencies:** 
\```bash
npm install
\```

4. **Set up environment variables:** 
Create a `.env` file in the root directory of the project and add the following environment variables:
\```
MONGO_URI=<Your MongoDB connection string>
SECRET=<Your session secret>
\```

5. **Start the server:** 
\```bash
npm start
\```

The food recipe website will be running on `http://localhost:5000`.

The application is now ready to use. You can register as a new user and start creating and managing recipes.