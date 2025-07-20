import { Database } from "./index";
import { UserSchema, User } from "./userSchema";

class UserService {
  private userSchema: UserSchema;

  constructor(db: Database) {
    this.userSchema = new UserSchema(db);
  }

  public async createUser(username: string, email: string): Promise<void> {
    await this.userSchema.insertUser(username, email);
  }
  public async findUserByEmail(email: string): Promise<User | null> {
    return await this.userSchema.getUserByEmail(email);
  }
  public async findUserById(id: number): Promise<User | null> {
    return await this.userSchema.getUserById(id);
  }
}

export { UserService };
