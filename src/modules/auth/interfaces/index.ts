import { UserEntity } from "src/modules/users/user.entity";

export interface IValidatedUser extends Omit<UserEntity, "password"> {}

export interface IAuthResult extends IValidatedUser {
    accessToken: string;
}