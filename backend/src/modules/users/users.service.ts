import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  async create(data: CreateUserDto) {
    const userExists = await this.usersRepository.findByEmail(data.email);

    if (userExists) {
      throw new BadRequestException('Email já em uso');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.usersRepository.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
    });

    const { password, ...result } = user;
    return result;
  }

  async findByEmail(email: string) {
    return this.usersRepository.findByEmail(email);
  }
}
