export interface IUser {
    id?: string;
    email: string;
    password: string;
}

export interface IUserGetBy {
    id?: string;
    email?: string;
}