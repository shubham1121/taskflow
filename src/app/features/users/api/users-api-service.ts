import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { UserModel } from "../models/users-model";

@Injectable({
    providedIn: "root"
})
export class UsersApiService {
    constructor(private readonly http: HttpClient) {}

    getAllUsers() : Observable<UserModel[]> {
        return this.http.get<UserModel[]>("/api/users");
    }

    getUserById(id: string) : Observable<UserModel> {
        return this.http.get<UserModel>(`/api/users/${id}`);
    }

    createUser(user: UserModel) : Observable<UserModel> {
        return this.http.post<UserModel>("/api/users", user);
    }

    deleteUser(id: string) : Observable<void> {
        return this.http.delete<void>(`/api/users/${id}`);
    }
}