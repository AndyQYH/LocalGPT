# Step 1: Use an official Node.js image as a base image for development
FROM node:20

# Step 2: Set the working directory in the container
WORKDIR /app

# Step 3: Copy package.json and package-lock.json (or yarn.lock) for dependency installation
COPY package*.json ./

# Step 4: Install dependencies
RUN npm install

# Step 5: Copy the rest of the frontend source files
COPY . .

# Step 6: Expose port (default Next.js runs on 3000)
EXPOSE 3000

# Step 7: Start the development server (Next.js or React app)
CMD ["npm", "run", "dev"]
