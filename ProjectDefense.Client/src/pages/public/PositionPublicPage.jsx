import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardBody, Chip, Button, Tabs, Tab } from '@heroui/react';
import { InformationCircleIcon, ChatBubbleLeftIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import positionApi from '../../api/positionApi';
import { useAuth } from '../../contexts/AuthContext';

export default function PositionPublicPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [position, setPosition] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPosition = async () => {
      if (!id) {
        // List all public positions
        try {
          const response = await positionApi.search({
            page: 1,
            pageSize: 50,
            isPublic: true,
          });
          setPosition({ list: response.data.data.items });
        } finally {
          setIsLoading(false);
        }
        return;
      }

      try {
        const response = await positionApi.getById(id);
        setPosition(response.data.data);
      } finally {
        setIsLoading(false);
      }
    };
    loadPosition();
  }, [id]);

  if (isLoading) return <div className="flex justify-center p-12">Loading...</div>;

  // List view (no ID)
  if (!id) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">{t('positions.title')}</h1>
        <div className="space-y-2">
          {position?.list?.map((pos) => (
            <Card
              key={pos.id}
              isPressable
              onPress={() => navigate(`/positions/${pos.id}`)}
            >
              <CardBody className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{pos.title}</p>
                  <p className="text-sm text-default-500">{pos.company} • {pos.level}</p>
                </div>
                <Chip size="sm" color="success" variant="flat">Public</Chip>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Detail view
  if (!position) return <div>Position not found</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{position.title}</h1>
          <div className="flex gap-2 mt-2">
            <Chip size="sm" color="primary" variant="flat">{position.company}</Chip>
            <Chip size="sm" color="secondary" variant="flat">{position.level}</Chip>
          </div>
        </div>
        {!isAuthenticated && (
          <Button color="primary" onPress={() => navigate('/login')}>
            <LockClosedIcon className="w-4 h-4 mr-2" />
            Login to Apply
          </Button>
        )}
      </div>

      <Tabs>
        <Tab key="info" title={<div className="flex items-center gap-2"><InformationCircleIcon className="w-4 h-4" /> Info</div>}>
          <Card>
            <CardBody>
              <p className="text-default-600">{position.description}</p>
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Required Attributes</h3>
                <div className="flex gap-2 flex-wrap">
                  {position.attributes?.map(attr => (
                    <Chip key={attr.id} variant="flat">{attr.name}</Chip>
                  ))}
                </div>
              </div>
            </CardBody>
          </Card>
        </Tab>
      </Tabs>
    </div>
  );
}