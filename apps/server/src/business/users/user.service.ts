import { Injectable } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { User } from "./entities/user.entity";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class UserService {
  private users: User[] = [];

  create(createUserDto: CreateUserDto): User | null {
    const user = {
      id: uuidv4(),
      ...createUserDto,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.push(user);
    return user;
  }

  findAll(): User[] {
    return this.users;
  }

  findOne(id: string): User | null {
    return this.users.find((user) => user.id === id) || null;
  }

  update(id: string, updateUserDto: UpdateUserDto): User | null {
    const userIndex = this.users.findIndex((user) => user.id === id);
    if (userIndex > -1) {
      this.users[userIndex] = { ...this.users[userIndex], ...updateUserDto };
      return this.users[userIndex];
    }
    return null;
  }

  remove(id: string): void {
    this.users = this.users.filter((user) => user.id !== id);
  }
}
