# Development of Live Chat App
# 1. 🧑‍💻 Fork a sample project
Fork a sample project into your own repository via this [github repo](https://github.com/maohieng/sample-live-chat-app).

1. go to the [github repo](https://github.com/maohieng/sample-live-chat-app), and click on **Fork**.
   
   ![fork action](./fork-action.png)

2. Input a repository name under your account. Make sure **Copy the `main` branch only** is checked.
   
   ![forked-repo-name](./fork-input-repo-name.png)

3. Click on **Create fork** button.

---
# 2. 🧑‍💻 Clone Your Forked Repo and run locally
1. Clone the repository you have forked.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Format the source code using:
   ```bash
   npm run format
   ```
4. Run linting to check and find the problem in source code:
   ```bash
   npm run lint
   ```
5. Run test to make sure nothing is boken:
   ```bash
   npm run test
   ```
6. Build the frontend code from typescript to pure javascript, using:
   ```bash
   npm run build
   ```
   If the build is passed, it will create a `dist` folder which contains the pure html, javascript and css source code.


## 🐢 Run locally
You can see the result by running the web application locally using `npm run dev`. It could be accessed via `http://localhost:3000` or similar.

## Docker build
You can build a docker image of this application since [Dockerfile](./Dockerfile) is provided. For example,
```bash
docker build -t live-chat-app .
```

---
# 🏋️‍♂️ Exercise
Follow the step below to do the exercise:
1. Create a new branch named `feat/workflows`
2. Create a Github Actions's workflows `ci.yml`. Add `feat/workflows` on `push` action.
   
  Example:
  ```yml
  name: Node CI

  on:
    push:
      branches: [ main, feat/workflows ]
    pull_request:
      branches: [ main ]

  jobs:
    test-and-build:
      runs-on: ubuntu-latest

      steps:
        - name: Checkout repository
          uses: actions/checkout@v4

        - name: Setup Node
          uses: actions/setup-node@v4
          with:
            node-version: 24

        - name: Install dependencies
          run: npm ci
          
          ...
          ...
  ```
3. Add **4 more step** to run:
   1. code format
   2. linting
   3. test
   4. build 
   
   See all commands in **[section 2](#2--clone-your-forked-repo-and-run-locally)** above.
4. Push your `ci.yml` and the new branch to your repository.
5. Check the CI actions in your github repository.
6. Post your result in assignment

>> Score: 10 points
