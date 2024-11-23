import { 
  ChatBubbleOutlineOutlined,
  FavoriteBorderOutlined,
  FavoriteOutlined,
  ShareOutlined,
  SendOutlined
} from '@mui/icons-material'
import { Box, Divider, IconButton, Typography, useTheme, InputBase } from '@mui/material'
import FlexBetween from 'components/FlexBetween'
import Friend from 'components/Friend'
import WidgetWrapper from 'components/WidgetWrapper'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setPost } from 'state'

const PostWidget = ({
  postId,
  postUserId,
  name,
  description,
  location,
  picturePath,
  userPicturePath,
  likes,
  comments,
}) => {
  const [isComments, setIsComments] = useState(false)
  const [newComment, setNewComment] = useState('') // Track new comment input
  const dispatch = useDispatch()
  const token = useSelector((state) => state.token)
  const loggedInUserId = useSelector((state) => state.user._id)
  const isLiked = Boolean(likes[loggedInUserId])
  const likeCount = Object.keys(likes).length

  const { palette } = useTheme()
  const main = palette.neutral.main
  const primary = palette.primary.main

  const patchLike = async () => {
    const response = await fetch(`http://localhost:3001/posts/${postId}/like`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId: loggedInUserId }),
    })
    const updatedPost = await response.json()
    dispatch(setPost({ post: updatedPost }))
  }

  // New function to handle comment submission
  const handleCommentSubmit = async () => {
    try {
      console.log("Submitting comment:", { userId: loggedInUserId, comment: newComment });
      const response = await fetch(`http://localhost:3001/posts/${postId}/comment`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: loggedInUserId, comment: newComment }),
      });
  
      if (!response.ok) {
        throw new Error(`Failed to add comment: ${response.status}`);
      }
  
      const updatedPost = await response.json();
      dispatch(setPost({ post: updatedPost }));
      setNewComment('');
    } catch (error) {
      console.error(error);
    }
  };
  
  
  

  return (
    <WidgetWrapper m="2rem 0">
      <Friend
        friendId={postUserId}
        name={name}
        subtitle={location}
        userPicturePath={userPicturePath}
      />
      <Typography color={main} sx={{ mt: '1rem' }}>
        {description}
      </Typography>
      {picturePath && (
        <img
          width="100%"
          height="auto"
          alt="post"
          style={{ borderRadius: '0.75rem', marginTop: '0.75rem' }}
          src={`http://localhost:3001/assets/${picturePath}`}
        />
      )}
      <FlexBetween mt="0.25rem">
        <FlexBetween gap="1rem">
          <FlexBetween gap="0.3rem">
            <IconButton onClick={patchLike}>
              {isLiked ? (
                <FavoriteOutlined sx={{ color: primary }} />
              ) : (
                <FavoriteBorderOutlined />
              )}
            </IconButton>
            <Typography>{likeCount}</Typography>
          </FlexBetween>

          <FlexBetween gap="0.3rem">
            <IconButton onClick={() => setIsComments(!isComments)}>
              <ChatBubbleOutlineOutlined />
            </IconButton>
            <Typography>{comments.length}</Typography>
          </FlexBetween>
        </FlexBetween>

        <IconButton>
          <ShareOutlined />
        </IconButton>
      </FlexBetween>
      
      {isComments && (
        <Box mt="0.5rem">
          {comments.map((commentObj, i) => {
            console.log("Comment Object:", commentObj); // Ensure `userName` and `timestamp` are present
            return (
              <Box key={`${name}-${i}`}>
                <Divider />
                <Typography sx={{ color: main, m: '0.5rem 0', pl: '1rem' }}>
                  <strong>{commentObj.name}</strong> {/* Display user's name */}
                  <span style={{ fontSize: '0.8rem', color: palette.neutral.medium, marginLeft: '0.5rem' }}>
                  {new Date(commentObj.createdAt).toLocaleString('en-US')} {/* Display formatted timestamp */}
                  </span>
                </Typography>
                <Typography sx={{ color: main, pl: '1rem' }}>
                  {commentObj.comment} {/* Display the comment text */}
                </Typography>
              </Box>
            );
          })}
          <Divider />
          <Box display="flex" mt="0.5rem">
            <InputBase
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              sx={{
                width: '100%',
                backgroundColor: palette.neutral.light,
                borderRadius: '2rem',
                padding: '0.5rem 1rem',
              }}
            />
            <IconButton onClick={handleCommentSubmit} disabled={!newComment}>
              <SendOutlined />
            </IconButton>
          </Box>
        </Box>
      )}
      
    </WidgetWrapper>
  )
}

export default PostWidget
