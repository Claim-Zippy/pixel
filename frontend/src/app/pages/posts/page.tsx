'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  DialogContentText,
  Box,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

interface BlogPost {
  name: string;
  description: string;
}

export default function FirstPost() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([
    {
      name: "Getting Started with React",
      description: "A beginner's guide to understanding React fundamentals and component-based architecture"
    },
    {
      name: "10 JavaScript Array Methods You Must Know",
      description: "Deep dive into essential JavaScript array methods like map, filter, reduce, and more"
    },
    {
      name: "CSS Grid vs Flexbox",
      description: "Comparing two powerful CSS layout systems and when to use each one"
    },
    {
      name: "TypeScript Best Practices",
      description: "Learn how to write better TypeScript code with these proven best practices and tips"
    },
    {
      name: "Introduction to Docker",
      description: "Understanding containers and how to use Docker for development and deployment"
    }
  ]);

  const [openEditModal, setOpenEditModal] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost>({ name: '', description: '' });
  const [editingIndex, setEditingIndex] = useState<number>(-1);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState<number>(-1);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [newPost, setNewPost] = useState<BlogPost>({ name: '', description: '' });

  const handleEdit = (index: number) => {
    setEditingPost({ ...blogPosts[index] });
    setEditingIndex(index);
    setOpenEditModal(true);
  };

  const handleSave = () => {
    const updatedPosts = [...blogPosts];
    updatedPosts[editingIndex] = editingPost;
    setBlogPosts(updatedPosts);
    setOpenEditModal(false);
  };

  const handleCancel = () => {
    setOpenEditModal(false);
    setEditingPost({ name: '', description: '' });
    setEditingIndex(-1);
  };

  const handleDelete = (index: number) => {
    setDeleteIndex(index);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    const updatedPosts = blogPosts.filter((_, index) => index !== deleteIndex);
    setBlogPosts(updatedPosts);
    setOpenDeleteDialog(false);
    setDeleteIndex(-1);
  };

  const handleCancelDelete = () => {
    setOpenDeleteDialog(false);
    setDeleteIndex(-1);
  };

  const handleAddNew = () => {
    setNewPost({ name: '', description: '' });
    setOpenAddModal(true);
  };

  const handleSaveNew = () => {
    setBlogPosts([...blogPosts, newPost]);
    setOpenAddModal(false);
    setNewPost({ name: '', description: '' });
  };

  const handleCancelAdd = () => {
    setOpenAddModal(false);
    setNewPost({ name: '', description: '' });
  };

  return (
    <div style={{ padding: '24px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Blog Posts
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddNew}
          sx={{
            '&:focus': {
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.4)',
              backgroundColor: 'primary.dark',
            },
            '&:hover': {
              transform: 'translateY(2px)',
            },
            transition: 'all 0.2s ease',
          }}
        >
          Add New Post
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="blog posts table">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {blogPosts.map((post, index) => (
              <TableRow
                key={index}
                sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { backgroundColor: '#f5f5f5' } }}
              >
                <TableCell>{post.name}</TableCell>
                <TableCell>{post.description}</TableCell>
                <TableCell align="center">
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => handleEdit(index)}
                    sx={{
                      mr: 1,
                      '&:focus': {
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                        backgroundColor: 'rgba(46, 125, 50, 0.08)',
                        borderColor: '#2e7d32',
                        color: '#2e7d32',
                      },
                      '&:hover': {
                        transform: 'translateY(2px)',
                        backgroundColor: 'rgba(25, 118, 210, 0.08)',
                        borderColor: '#1976d2',
                        color: '#1976d2',
                      },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDelete(index)}
                    sx={{
                      '&:focus': {
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                        backgroundColor: 'rgba(211, 47, 47, 0.08)',
                      },
                      '&:hover': {
                        transform: 'translateY(2px)',
                      },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add New Blog Modal */}
      <Dialog 
        open={openAddModal} 
        onClose={handleCancelAdd}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Blog Post</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            fullWidth
            value={newPost.name}
            onChange={(e) => setNewPost({ ...newPost, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={newPost.description}
            onChange={(e) => setNewPost({ ...newPost, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelAdd} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleSaveNew} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Modal */}
      <Dialog 
        open={openEditModal} 
        onClose={handleCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Blog Post</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            fullWidth
            value={editingPost.name}
            onChange={(e) => setEditingPost({ ...editingPost, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={editingPost.description}
            onChange={(e) => setEditingPost({ ...editingPost, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCancelDelete}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete this blog post? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
