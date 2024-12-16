# Run

- The whole project has been containerized and can be run with a single command.

    `docker-compose up`

- You can manually run the application with `nodemone` in case you have redis already running.

# Testing

- for the api testing purposes all the apis are provided as postman collections.

- You would have to import the `postman_collections` folder in the postman.

- In there, All the APIs are ready with their body and params, You just need to send the request.

### Athentication

    - for using all the apis, You would have to Login/ Signup. You can use my credentials in the Auth/ login API
        to avoid the SignUp.

    - Authentication is done using JWT.

- Quiz collection contains all the other APIs.

# SQL Schema

- I am using NoSQL database, but all the schemas are in the `db` folder. 

# Folder Structure

- All the folder names are compliment with their work. So, `router` contains all the api routing code, `Controllers` contain
    all the controllers ans so on...

     