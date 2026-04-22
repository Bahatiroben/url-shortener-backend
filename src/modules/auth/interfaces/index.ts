import { User } from "@modules/users/entities";

export interface IValidatedUser extends Omit<User, "password"> {}

export interface IAuthResult extends IValidatedUser {
    accessToken: string;
}