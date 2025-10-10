import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { ENV } from './config/env';
import { User } from './entity/User';
import { Role } from './entity/Role';
import { Post } from './entity/Post';
import { Comment } from './entity/Comment';

const isProd = ENV.NODE_ENV === 'production';

export const AppDataSource = new DataSource({
  type: ENV.DB.type,                   
  host: ENV.DB.host,
  port: ENV.DB.port,
  username: ENV.DB.user,
  password: ENV.DB.pass,
  database: ENV.DB.name,
  entities: [User, Role, Post, Comment],
  synchronize: !isProd,                
  logging: !isProd,
});