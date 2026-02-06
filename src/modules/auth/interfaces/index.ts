import { UserEntity } from "src/modules/user/user.entity";

export interface IValidatedUser extends Omit<UserEntity, "password"> {}

export interface IAuthResult extends IValidatedUser {
    accessToken: string;
}