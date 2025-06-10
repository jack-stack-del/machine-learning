
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ExternalLink, Play } from 'lucide-react';

interface VideoPlayerProps {
  videoUrl: string;
}

const VideoPlayer = ({ videoUrl }: VideoPlayerProps) => {
  const [showVideo, setShowVideo] = useState(false);
  
  // Extract YouTube video ID from URL
  const getYouTubeEmbedUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      let videoId = '';
      
      if (urlObj.hostname === 'youtu.be') {
        videoId = urlObj.pathname.slice(1);
      } else if (urlObj.hostname === 'www.youtube.com' || urlObj.hostname === 'youtube.com') {
        videoId = urlObj.searchParams.get('v') || '';
      }
      
      if (videoId) {
        return `https://www.youtube-nocookie.com/embed/${videoId}`;
      }
      return null;
    } catch {
      return null;
    }
  };

  const embedUrl = getYouTubeEmbedUrl(videoUrl);

  if (!embedUrl) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert>
            <AlertDescription>
              Ogiltig video-URL. Kontrollera att det är en giltig YouTube-länk.
            </AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button variant="outline" asChild>
              <a href={videoUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Öppna video i ny flik
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!showVideo) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <Play className="h-16 w-16 text-gray-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Klicka för att ladda video</h3>
              <p className="text-sm text-gray-600">
                Videon laddas från YouTube och kan innehålla annonser.
              </p>
            </div>
            <div className="flex space-x-2 justify-center">
              <Button onClick={() => setShowVideo(true)}>
                <Play className="mr-2 h-4 w-4" />
                Ladda video
              </Button>
              <Button variant="outline" asChild>
                <a href={videoUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Öppna på YouTube
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          <iframe
            src={embedUrl}
            title="Lektion Video"
            className="absolute inset-0 w-full h-full rounded-lg"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <div className="p-4 border-t">
          <Button variant="outline" size="sm" asChild>
            <a href={videoUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Öppna på YouTube
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoPlayer;
