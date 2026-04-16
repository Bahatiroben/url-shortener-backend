import { Body, Controller, Post } from "@nestjs/common";
import { UserService } from "./services";
import { CreateUserDto } from "./dtos";

@Controller('v1/user')
export class UserController {
    constructor(
        private userService: UserService
    ) {

    }

}