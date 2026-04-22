import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../entities";
import { Repository } from "typeorm";
import { BaseService } from "@common/base";
import { CreateUserDto, UpdateUserDto } from "../dtos";

@Injectable()
export class UserService extends BaseService<User, CreateUserDto, UpdateUserDto> {

    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>
    ) {
        super(userRepository);
    }

}