import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "./user.entity";
import { Repository } from "typeorm";
import { IUser, IUserGetBy } from "./interfaces";
import { hashPassword } from "./utils";

@Injectable()
export class UserService {

    constructor(
        @InjectRepository(UserEntity)
        private userRepository: Repository<UserEntity>
    ) {

    }

    async create(user: IUser): Promise<UserEntity> {
        return this.userRepository.save(user);
    }

    async findUserBy(params: IUserGetBy): Promise<UserEntity> {
        return this.userRepository.findOne({
            where: params
        });
    }

    async getAllBy(params: IUserGetBy): Promise<UserEntity[]> {
        return this.userRepository.find({
            where: params
        });
    }

}