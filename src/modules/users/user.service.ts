import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "./user.entity";
import { Repository } from "typeorm";
import { IUser, IUserGetBy } from "./interfaces";
import { hashPassword } from "./utils";
import { BaseService } from "src/common/base";
import { CreateUserDto } from "./dtos";
import { UpdateUserDto } from "./dtos";

@Injectable()
export class UserService extends BaseService<UserEntity, CreateUserDto, UpdateUserDto> {

    constructor(
        @InjectRepository(UserEntity)
        private userRepository: Repository<UserEntity>
    ) {
        super(userRepository);
    }

}