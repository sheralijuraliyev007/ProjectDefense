import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { HeartIcon } from '@heroicons/react/24/outline';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  Tabs,
  Tab,
  Input,
  Avatar,
  Divider,
  Badge,
} from '@heroui/react';
import {
  ArrowLeftIcon,
  ChatBubbleLeftIcon,
  DocumentTextIcon,
  InformationCircleIcon,
  UsersIcon,
  PaperAirplaneIcon,
} from '@heroicons/react/24/outline';
import positionApi from '../../api/positionApi';
import cvApi from '../../api/cvApi';
import DataTable from '../../components/shared/DataTable';
import { useAuth } from '../../contexts/AuthContext';

// WebSocket hook for real-time discussion
function useWebSocket(url) {
  const [messages, setMessages] = useState([]);
  const ws = useRef(null);

  useEffect(() => {
    ws.current = new WebSocket(url);
    
    ws.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages(prev => [...prev, message]);
    };

    return () => ws.current?.close();
  }, [url]);

  const sendMessage = useCallback((text) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ text, timestamp: new Date().toISOString() }));
    }
  }, []);

  return { messages, sendMessage };
}

export default function PositionDetailPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  
  const [position, setPosition] = useState(null);
  const [cvs, setCvs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');
  const [newPost, setNewPost] = useState('');
  
  // For polling fallback (if WebSocket not available)
  const [discussionPosts, setDiscussionPosts] = useState([]);
  
  // Try WebSocket, fallback to polling
  const wsUrl = `wss://your-api/ws/positions/${id}/discussion`;
  // const { messages: wsMessages, sendMessage } = useWebSocket(wsUrl);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [posRes, cvsRes] = await Promise.all([
          positionApi.getById(id),
          cvApi.search({ positionId: id, pageSize: 100 }),
        ]);
        setPosition(posRes.data.data);
        setCvs(cvsRes.data.data.items);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [id]);

  // Polling for discussion (every 3 seconds)
  useEffect(() => {
    const pollDiscussion = async () => {
      try {
        // const response = await positionApi.getDiscussion(id);
        // setDiscussionPosts(response.data.data);
      } catch (err) {
        // Silently fail polling
      }
    };
    
    pollDiscussion();
    const interval = setInterval(pollDiscussion, 3000);
    return () => clearInterval(interval);
  }, [id]);

  const handleSendPost = async () => {
    if (!newPost.trim()) return;
    
    try {
      // await positionApi.addPost(id, { text: newPost });
      // Optimistic update
      setDiscussionPosts(prev => [...prev, {
        id: Date.now(),
        authorName: `${user.firstName} ${user.lastName}`,
        authorId: user.id,
        text: newPost,
        createdAt: new Date().toISOString(),
      }]);
      setNewPost('');
    } catch (err) {
      console.error(err);
    }
  };

  const cvColumns = [
    { key: 'candidateName', label: 'Candidate' },
    {
      key: 'status',
      label: 'Status',
      renderCell: (item) => (
        <Chip color={item.isPublished ? 'success' : 'default'} size="sm" variant="flat">
          {item.isPublished ? 'Published' : 'Draft'}
        </Chip>
      ),
    },
    {
      key: 'likesCount',
      label: t('cvs.likes'),
      renderCell: (item) => (
        <div className="flex items-center gap-1">
          <HeartIcon className="w-4 h-4 text-danger" />
          {item.likesCount}
        </div>
      ),
    },
    {
      key: 'updatedAt',
      label: 'Updated',
      renderCell: (item) => new Date(item.updatedAt).toLocaleDateString(),
    },
  ];

  if (isLoading) {
    return <div className="flex justify-center p-12"><Spinner size="lg" /></div>;
  }

  if (!position) return null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button isIconOnly variant="light" onPress={() => navigate(-1)}>
            <ArrowLeftIcon className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{position.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Chip size="sm" color="primary" variant="flat">{position.company}</Chip>
              <Chip size="sm" color="secondary" variant="flat">{position.level}</Chip>
              <Chip size="sm" color={position.isPublic ? 'success' : 'warning'} variant="flat">
                {position.isPublic ? t('positions.public') : t('positions.restricted')}
              </Chip>
            </div>
          </div>
        </div>
        <Button
          color="primary"
          onPress={() => navigate(`/cvs/new?positionId=${id}`)}
        >
          Create CV
        </Button>
      </div>

      <Tabs selectedKey={activeTab} onSelectionChange={setActiveTab}>
        <Tab key="info" title={<div className="flex items-center gap-2"><InformationCircleIcon className="w-4 h-4" /> Info</div>}>
          <Card>
            <CardBody className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-default-600">{position.description}</p>
              </div>
              <Divider />
              <div>
                <h3 className="font-semibold mb-2">Attributes</h3>
                <div className="flex gap-2 flex-wrap">
                  {position.attributes?.map(attr => (
                    <Chip key={attr.id} variant="flat" color="primary">{attr.name}</Chip>
                  ))}
                </div>
              </div>
              <Divider />
              <div>
                <h3 className="font-semibold mb-2">Project Tags</h3>
                <div className="flex gap-2 flex-wrap">
                  {position.projectTags?.map(tag => (
                    <Chip key={tag} variant="flat" color="secondary">{tag}</Chip>
                  ))}
                </div>
              </div>
              <Divider />
              <div>
                <h3 className="font-semibold mb-2">Access Rules</h3>
                {position.accessRules?.map((rule, idx) => (
                  <div key={idx} className="text-sm text-default-600 bg-default-50 p-2 rounded-lg mb-2">
                    {rule.attributeName} {rule.operator} {rule.value}
                  </div>
                )) || <p className="text-default-400">No access rules defined</p>}
              </div>
            </CardBody>
          </Card>
        </Tab>

        <Tab key="cvs" title={<div className="flex items-center gap-2"><DocumentTextIcon className="w-4 h-4" /> CVs ({cvs.length})</div>}>
          <Card>
            <CardBody>
              <DataTable
                columns={cvColumns}
                data={cvs}
                onRowClick={(item) => navigate(`/cvs/${item.id}`)}
                emptyContent="No CVs submitted yet"
              />
            </CardBody>
          </Card>
        </Tab>

        <Tab key="discussion" title={<div className="flex items-center gap-2"><ChatBubbleLeftIcon className="w-4 h-4" /> Discussion</div>}>
          <Card>
            <CardBody className="space-y-4">
              {/* Posts */}
              <div className="space-y-4 max-h-[500px] overflow-y-auto">
                {discussionPosts.length === 0 && (
                  <p className="text-center text-default-400 py-8">No posts yet. Start the discussion!</p>
                )}
                {discussionPosts.map((post) => (
                  <div key={post.id} className="flex gap-3 p-3 bg-default-50 rounded-lg">
                    <Avatar
                      name={post.authorName}
                      className="w-10 h-10"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="font-medium text-sm cursor-pointer hover:text-primary"
                          onClick={() => hasRole(['Recruiter', 'Administrator']) && navigate(`/profile/${post.authorId}`)}
                        >
                          {post.authorName}
                        </span>
                        <span className="text-xs text-default-400">
                          {new Date(post.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div
                        className="markdown-content text-sm"
                        dangerouslySetInnerHTML={{ __html: post.text?.replace(/\n/g, '<br>') || '' }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <Divider />

              {/* New Post Input */}
              <div className="flex gap-2">
                <Input
                  className="flex-1"
                  placeholder="Write a message..."
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendPost()}
                />
                <Button
                  color="primary"
                  isIconOnly
                  onPress={handleSendPost}
                  isDisabled={!newPost.trim()}
                >
                  <PaperAirplaneIcon className="w-5 h-5" />
                </Button>
              </div>
            </CardBody>
          </Card>
        </Tab>
      </Tabs>
    </div>
  );
}