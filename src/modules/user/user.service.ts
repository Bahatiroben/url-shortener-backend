import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./user.entity";
import { Repository } from "typeorm";
import { IUser, IUserGetBy } from "./interfaces";
import { hashPassword } from "./utils";

@Injectable()
export class UserService {

    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>
    ) {

    }

    async create(user: IUser) {
        const hashedPassword = await hashPassword(user.password);
        return this.userRepository.save({...user, password: hashedPassword});
    }

    async getBy(params: IUserGetBy) {
        return this.userRepository.findOne({
            where: params
        });
    }

}