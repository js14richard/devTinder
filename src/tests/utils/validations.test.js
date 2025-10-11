const {validateSignupData} = require('../../utils/validations');

describe("tests the validateSignUpData utility", () =>{
    it('should throw an error for invalid userName', ()=>{
        let req = {
            body : {
                firstName: "s",
                email:"testing@email.com",
                password:"Testing@1234"
            }
        };
        expect(() => validateSignupData(req))
            .toThrow("First name must be between 2 and 30 characters");        
    });

    it('should throw an error for invalid email', ()=>{
        let req = {
            body : {
                firstName: "siril",
                email:"testInvalidEmail",
                password:"Testing@1234"
            }
        };
        expect(()=> validateSignupData(req))
            .toThrow("Invalid email format");
    });

    it('shouldthrow error for weak passwords', ()=>{
        let req = {
            body : {
                firstName: "siril",
                email:"testing@email.com",
                password:"weak"
            }
        };
        expect(()=> validateSignupData(req))
            .toThrow("Password must be between 6 and 20 characters");
    })
});