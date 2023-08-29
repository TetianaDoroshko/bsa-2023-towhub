import { type IService } from '~/libs/interfaces/interfaces.js';
import { encryptService } from '~/libs/packages/packages.js';

import {
  type CustomerSignUpRequestDto,
  type CustomerSignUpResponseDto,
  type UserEntityT,
  type UserGetAllResponseDto,
} from './libs/types/types.js';
import { type UserRepository } from './user.repository.js';

class UserService implements IService {
  private userRepository: UserRepository;

  public constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  public find(): ReturnType<IService['find']> {
    return this.userRepository.find();
  }

  public async findByPhoneOrEmail({
    phone,
    email,
  }: CustomerSignUpRequestDto): Promise<
    (UserEntityT & { createdAt: Date; updatedAt: Date }) | null
  > {
    return await this.userRepository.findByPhoneOrEmail({
      phone,
      email,
    });
  }

  public findById(id: number): ReturnType<IService['find']> {
    return this.userRepository.findById(id);
  }

  public async findAll(): Promise<UserGetAllResponseDto> {
    const items = await this.userRepository.findAll();

    return {
      items: items.map((it) => it.toObject()),
    };
  }

  public async create(
    payload: CustomerSignUpRequestDto,
  ): Promise<CustomerSignUpResponseDto> {
    const { email: userEmail, password, ...newUser } = payload;
    const { passwordHash, passwordSalt } =
      await encryptService.encrypt(password);
    const user = await this.userRepository.create({
      ...newUser,
      groupId: 1, //TEMPORARY MOCK
      email: userEmail.toLowerCase(),
      passwordSalt,
      passwordHash,
    });

    const { id, phone, email, firstName, lastName, groupId } = user;

    return { id, phone, email, firstName, lastName, groupId };
  }

  public update(): ReturnType<IService['update']> {
    return Promise.resolve(null);
  }

  public delete(): ReturnType<IService['delete']> {
    return Promise.resolve(true);
  }
}

export { UserService };
