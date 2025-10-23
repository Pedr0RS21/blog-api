import type { Request, Response } from 'express';
import { AppDataSource } from '../data-source.js';
import { Post } from '../entity/Post.js';
import { User } from '../entity/User.js';
import { Comment } from '../entity/Comment.js';

function toDTO(p: Post) {
  return {
    id: p.id,
    title: p.title,
    content: p.content,
    author: p.author ? { id: p.author.id, name: p.author.name, userName: p.author.userName } : null,
    comments: p.comments?.map(c => ({
      id: c.id,
      content: c.content,
      author: { id: c.author.id, name: c.author.name, userName: c.author.userName },
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    })) ?? [],
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

export class PostController {
  /** POST /api/posts (crear) */
  static crearPost = async (req: Request, res: Response) => {
    try {
      const { title, content, authorId } = req.body as {
        title: string;
        content: string;
        authorId: number;
      };

      if (!title || title.trim() === '') {
        return res.status(400).json({ error: 'El título del post es obligatorio.' });
      }

      if (!content || content.trim() === '') {
        return res.status(400).json({ error: 'El contenido del post es obligatorio.' });
      }

      if (!authorId || !Number.isInteger(authorId) || authorId <= 0) {
        return res.status(400).json({ error: 'El ID del autor es inválido.' });
      }

      const userRepo = AppDataSource.getRepository(User);
      const postRepo = AppDataSource.getRepository(Post);

      const author = await userRepo.findOne({ where: { id: authorId, activo: true } });
      if (!author) {
        return res.status(404).json({ error: 'Autor no encontrado o inactivo.' });
      }

      const post = new Post();
      post.title = title.trim();
      post.content = content.trim();
      post.author = author;
      post.comments = [];

      await postRepo.save(post);
      return res.status(201).json(toDTO(post));
    } catch (error) {
      console.error('[PostController.crearPost]', error);
      return res.status(500).json({ error: 'Ocurrió un error al crear el post.' });
    }
  };

  /** GET /api/posts (listar todos) */
  static obtenerPosts = async (_req: Request, res: Response) => {
    try {
      const repo = AppDataSource.getRepository(Post);
      const posts = await repo.find({
        relations: ['author', 'comments', 'comments.author'],
        order: { createdAt: 'DESC' },
      });
      return res.status(200).json(posts.map(toDTO));
    } catch (error) {
      console.error('[PostController.obtenerPosts]', error);
      return res.status(500).json({ error: 'Ocurrió un error al obtener los posts.' });
    }
  };

  /** GET /api/posts/:idPost */
  static obtenerPostPorId = async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.idPost);
      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      const repo = AppDataSource.getRepository(Post);
      const post = await repo.findOne({
        where: { id },
        relations: ['author', 'comments', 'comments.author'],
      });

      if (!post) {
        return res.status(404).json({ error: 'Post no encontrado' });
      }

      return res.status(200).json(toDTO(post));
    } catch (error) {
      console.error('[PostController.obtenerPostPorId]', error);
      return res.status(500).json({ error: 'Ocurrió un error al obtener el post.' });
    }
  };

  /** PUT /api/posts/:idPost */
  static editarPost = async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.idPost);
      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      const { title, content } = req.body as {
        title?: string;
        content?: string;
      };

      const postRepo = AppDataSource.getRepository(Post);
      const post = await postRepo.findOne({
        where: { id },
        relations: ['author', 'comments', 'comments.author'],
      });

      if (!post) {
        return res.status(404).json({ error: 'Post no encontrado' });
      }

      if (title && title.trim() !== '') {
        post.title = title.trim();
      }

      if (content && content.trim() !== '') {
        post.content = content.trim();
      }

      await postRepo.save(post);
      return res.status(200).json(toDTO(post));
    } catch (error) {
      console.error('[PostController.editarPost]', error);
      return res.status(500).json({ error: 'Ocurrió un error al editar el post.' });
    }
  };

  /** DELETE /api/posts/:idPost */
  static eliminarPost = async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.idPost);
      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      const postRepo = AppDataSource.getRepository(Post);
      const post = await postRepo.findOne({ where: { id } });

      if (!post) {
        return res.status(404).json({ error: 'Post no encontrado' });
      }

      await postRepo.remove(post);
      return res.status(200).json({ success: true, message: 'Post eliminado exitosamente' });
    } catch (error) {
      console.error('[PostController.eliminarPost]', error);
      return res.status(500).json({ error: 'Ocurrió un error al eliminar el post.' });
    }
  };

  /** GET /api/posts/usuario/:idUsuario (listar posts de un usuario) */
  static obtenerPostsPorUsuario = async (req: Request, res: Response) => {
    try {
      const idUsuario = Number(req.params.idUsuario);
      if (!Number.isInteger(idUsuario) || idUsuario <= 0) {
        return res.status(400).json({ error: 'ID de usuario inválido' });
      }

      const userRepo = AppDataSource.getRepository(User);
      const usuario = await userRepo.findOne({ where: { id: idUsuario, activo: true } });

      if (!usuario) {
        return res.status(404).json({ error: 'Usuario no encontrado o inactivo' });
      }

      const postRepo = AppDataSource.getRepository(Post);
      const posts = await postRepo.find({
        where: { author: { id: idUsuario } },
        relations: ['author', 'comments', 'comments.author'],
        order: { createdAt: 'DESC' },
      });

      return res.status(200).json(posts.map(toDTO));
    } catch (error) {
      console.error('[PostController.obtenerPostsPorUsuario]', error);
      return res.status(500).json({ error: 'Ocurrió un error al obtener los posts del usuario.' });
    }
  };

  /** POST /api/posts/:idPost/comentarios (agregar comentario) */
  static agregarComentario = async (req: Request, res: Response) => {
    try {
      const idPost = Number(req.params.idPost);
      const { content, authorId } = req.body as {
        content: string;
        authorId: number;
      };

      if (!Number.isInteger(idPost) || idPost <= 0) {
        return res.status(400).json({ error: 'ID del post inválido' });
      }

      if (!content || content.trim() === '') {
        return res.status(400).json({ error: 'El contenido del comentario es obligatorio.' });
      }

      if (!authorId || !Number.isInteger(authorId) || authorId <= 0) {
        return res.status(400).json({ error: 'El ID del autor es inválido.' });
      }

      const postRepo = AppDataSource.getRepository(Post);
      const userRepo = AppDataSource.getRepository(User);
      const commentRepo = AppDataSource.getRepository(Comment);

      const post = await postRepo.findOne({ where: { id: idPost } });
      if (!post) {
        return res.status(404).json({ error: 'Post no encontrado' });
      }

      const author = await userRepo.findOne({ where: { id: authorId, activo: true } });
      if (!author) {
        return res.status(404).json({ error: 'Autor no encontrado o inactivo.' });
      }

      const comment = new Comment();
      comment.content = content.trim();
      comment.author = author;
      comment.post = post;

      await commentRepo.save(comment);

      const postActualizado = await postRepo.findOne({
        where: { id: idPost },
        relations: ['author', 'comments', 'comments.author'],
      });

      return res.status(201).json(toDTO(postActualizado!));
    } catch (error) {
      console.error('[PostController.agregarComentario]', error);
      return res.status(500).json({ error: 'Ocurrió un error al agregar el comentario.' });
    }
  };

  /** DELETE /api/posts/:idPost/comentarios/:idComentario (eliminar comentario) */
  static eliminarComentario = async (req: Request, res: Response) => {
    try {
      const idPost = Number(req.params.idPost);
      const idComentario = Number(req.params.idComentario);

      if (!Number.isInteger(idPost) || idPost <= 0 || !Number.isInteger(idComentario) || idComentario <= 0) {
        return res.status(400).json({ error: 'IDs inválidos' });
      }

      const postRepo = AppDataSource.getRepository(Post);
      const commentRepo = AppDataSource.getRepository(Comment);

      const post = await postRepo.findOne({ where: { id: idPost } });
      if (!post) {
        return res.status(404).json({ error: 'Post no encontrado' });
      }

      const comment = await commentRepo.findOne({ where: { id: idComentario, post: { id: idPost } } });
      if (!comment) {
        return res.status(404).json({ error: 'Comentario no encontrado' });
      }

      await commentRepo.remove(comment);

      const postActualizado = await postRepo.findOne({
        where: { id: idPost },
        relations: ['author', 'comments', 'comments.author'],
      });

      return res.status(200).json({
        success: true,
        message: 'Comentario eliminado exitosamente',
        data: toDTO(postActualizado!),
      });
    } catch (error) {
      console.error('[PostController.eliminarComentario]', error);
      return res.status(500).json({ error: 'Ocurrió un error al eliminar el comentario.' });
    }
  };

  /** GET /api/posts/:idPost/comentarios (listar comentarios de un post) */
  static obtenerComentarios = async (req: Request, res: Response) => {
    try {
      const idPost = Number(req.params.idPost);
      if (!Number.isInteger(idPost) || idPost <= 0) {
        return res.status(400).json({ error: 'ID del post inválido' });
      }

      const postRepo = AppDataSource.getRepository(Post);
      const post = await postRepo.findOne({
        where: { id: idPost },
        relations: ['comments', 'comments.author'],
      });

      if (!post) {
        return res.status(404).json({ error: 'Post no encontrado' });
      }

      const comentarios = (post.comments ?? []).map(c => ({
        id: c.id,
        content: c.content,
        author: { id: c.author.id, name: c.author.name, userName: c.author.userName },
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      }));

      return res.status(200).json({ success: true, data: comentarios, total: comentarios.length });
    } catch (error) {
      console.error('[PostController.obtenerComentarios]', error);
      return res.status(500).json({ error: 'Ocurrió un error al obtener los comentarios.' });
    }
  };
}