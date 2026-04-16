import { Body, Controller, Post } from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto } from "./createUser.dto.ts/createUser.dto";

@Controller('user')
export class UserController {
    constructor(
        private userService: UserService
    ) {

    }

}