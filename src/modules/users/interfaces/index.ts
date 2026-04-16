export interface IUser {
    id?: string;
    username: string;
    email: string;
    password: string;
}

export interface IUserGetBy {
    id?: string;
    username?: string;
    email?: string;
}