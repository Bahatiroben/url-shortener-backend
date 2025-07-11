export interface IUser {
    id?: number;
    username: string;
    email: string;
    password: string;
}

export interface IUserGetBy {
    id?: number;
    username?: string;
    email?: string;
}