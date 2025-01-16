import { useEffect } from 'react';
import emailjs from '@emailjs/browser';

const EMAIL_STORAGE_KEY = 'valentine_notification_email';

interface SongStatusNotifierProps {
  songId: string;
  status: 'pending' | 'completed' | 'failed';
  prompt: string;
  songTitle?: string;
  songUrl?: string;
  notificationSent?: boolean;
  onNotificationSent?: (songId: string) => void;
}

export function SongStatusNotifier({
  songId,
  status,
  prompt,
  songTitle,
  songUrl,
  notificationSent,
  onNotificationSent
}: SongStatusNotifierProps) {
  useEffect(() => {
    const sendNotification = async () => {
      const userEmail = localStorage.getItem(EMAIL_STORAGE_KEY);
      
      if (!userEmail || notificationSent) {
        return;
      }

      try {
        console.log('Sending status notification:', {
          status,
          songId,
          userEmail
        });

        const emailData = {
          to_email: userEmail,
          from_name: "Valentine's Song Generator",
          to_name: "Music Lover",
          reply_to: "no-reply@example.com",
          song_prompt: prompt,
          song_status: status,
          song_title: songTitle || 'Your Valentine\'s Song',
          song_url: songUrl || '',
          timestamp: new Date().toLocaleString(),
          message: getStatusMessage(status, songTitle)
        };

        const result = await emailjs.send(
          import.meta.env.VITE_EMAILJS_SERVICE_ID,
          import.meta.env.VITE_EMAILJS_SONG_STATUS_TEMPLATE_ID,
          emailData,
          import.meta.env.VITE_EMAILJS_PUBLIC_KEY
        );

        console.log('Status notification sent:', result);
        
        if (onNotificationSent) {
          onNotificationSent(songId);
        }

      } catch (error) {
        console.error('Failed to send status notification:', error);
      }
    };

    sendNotification();
  }, [songId, status, prompt, songTitle, songUrl, notificationSent, onNotificationSent]);

  return null;
}

function getStatusMessage(status: string, songTitle?: string) {
  switch (status) {
    case 'pending':
      return `Your Valentine's song "${songTitle || 'Your Love Song'}" is being created! We'll notify you when it's ready.`;
    case 'completed':
      return `Great news! Your Valentine's song "${songTitle || 'Your Love Song'}" is ready to play!`;
    case 'failed':
      return `We encountered an issue while creating "${songTitle || 'Your Love Song'}". Please try again.`;
    default:
      return `Status update for your Valentine's song "${songTitle || 'Your Love Song'}"`;
  }
} 