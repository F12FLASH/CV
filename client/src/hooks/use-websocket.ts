import { useEffect, useRef, useCallback, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface WebSocketMessage {
  type: string;
  data: any;
}

const notificationSound = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleR8LYLTl23NeABaZ4edeRAAcr+NuNQ4Rut94JQAOx+9xGgAPzu9nCgAP1e9dAAAA3u9QAAAE4u9BAAAI5e8wAAAM6O8eAAAQ6+8LAAAb8vIADgAm+vgHEQAy//4NEgA7//8RDgA9//8YCAA8//8bAgA3//8e/AA0//8h+QAv//8k9gAp//8n8gAi//8q7gAa//8t6wAT//8wygAM//8z0AAF//826QAA//865v/7//8+4v/3//9B3v/x//9E1v/r//9Hzv/l//9Kxv/f//9Nvv/Z//9Qtv/T//9Trv/N//9WqP/I//9Zo//C//9cnf++//9fl//5//9jkf/0//9mix/v//9ph//q//9sgf/l//9wff/h//90eP/d//94c//Y//98bv/U//+AaP/Q///Egf7L///IY/7H///MXf7D///QWP6///TUUv67///YTP63///cRv6z///gP/6w///kOf6s///oM/6p///sLf6l///wJ/6h///0Iv6e///4HP6a///8Fv6W//8AEf6T//8EC/6P//8IBf6M//8MA/6I//8QAP6F//8U/v6B//8Y+/5+//8c+P57//8g9f54//8k8v51//8o7/5y//8s7P5v//8w6f5s//807v5p//847/5m//8++f5k//9C//5h//9GC/5e//9KGP5b//9OJf5Y//9SM/5V//9WQP5S//9aTv5P//9eXP5N//9ia/5K//9mef5H//9qh/5E//9ulv5B//9ypf4+//92s/47//96wf44//9+z/41///CUf4z///GMP4x///KD/4u///O7v0r///S0P0o///Wrf0l///anf0i///erv0f///ipP0c///mff0a///qav0X///uVf0U///yQP0R///2K/0O///6Fv0L///+Af0I//8C7fwF//8G2PwC//8Kw/z///8Orvz8//8SmPz5//8Wg/z2//8abfzz//8eV/zw//8iQfzt//8mK/zq//8qFfzn//8u//8vl//8y6fvi//826/vf//86yfvc//8+q/vZ///Gcf3X///KVP3U///OO/3R///SNf3O///WMP3L///aLv3I///eLP3F///iKv3C///mLP2////qLv28///uMv26//8yOf24//82QP21//86Sf2z//8+U/2w///CV/2t///GXf2q///Kd/2n///Od/2l///Sbv2i///WVf2f///aO/2c///eH/2Z///iA/2W///m5/yT///q0PyR///uuPyO//8yof6L//82if6I//86cf6F//8+Wf6C///CQf5////GKf58///KD/55///O9f12///S2/1z///WwP1w///aqP1t///elv1q///inP1n///mwP1k///q6v1h///uFP5e//8yQP5b//82bP5Y//86mP5V//8+xP5S///C8P5P///GHP9M///KSP9J///OdP9G///SoP9D///WzP9A///a+P89///e" + "//86///i//83///m//80///q//8x///u//8u//8y//8r//82//8o//86//8l//8+//8i///C//8f///G//8c///K//8Z///O//8W///S//8T///W//8Q///a//8N///e//8K///i//8H///m//8E///q//8B///u/////8=");

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isClosingRef = useRef(false);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const playNotificationSound = useCallback(() => {
    notificationSound.currentTime = 0;
    notificationSound.volume = 0.5;
    notificationSound.play().catch(() => {});
  }, []);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN || isClosingRef.current) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    try {
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        setIsConnected(true);
      };

      wsRef.current.onmessage = async (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);

          if (message.type === "NEW_MESSAGE") {
            playNotificationSound();

            toast({
              title: "New Contact Message",
              description: `${message.data?.sender || 'Someone'}: ${message.data?.subject || "No subject"}`,
              duration: 5000,
            });

            queryClient.invalidateQueries({ queryKey: ['messages'] });
          }

          const isNewComment = message.type === "NEW_COMMENT" || 
            (message.type === "NOTIFICATION" && message.data?.type === "NEW_COMMENT");

          if (isNewComment) {
            playNotificationSound();
            const commentData = message.type === "NEW_COMMENT" ? message.data : message.data?.data;
            const msgText = message.type === "NOTIFICATION" 
              ? message.data?.message 
              : `New comment from ${commentData?.authorName || 'Someone'}`;

            toast({
              title: "New Comment",
              description: msgText || "New comment received",
              duration: 5000,
            });

            queryClient.invalidateQueries({ queryKey: ['/api/comments'] });
          }

          const isNewReview = message.type === "NEW_REVIEW" || 
            (message.type === "NOTIFICATION" && message.data?.type === "NEW_REVIEW");

          if (isNewReview) {
            playNotificationSound();
            const reviewData = message.type === "NEW_REVIEW" ? message.data : message.data?.data;
            const msgText = message.type === "NOTIFICATION" 
              ? message.data?.message 
              : `New ${reviewData?.rating || 5}-star review from ${reviewData?.authorName || 'Someone'}`;

            toast({
              title: "New Review",
              description: msgText || "New review received",
              duration: 5000,
            });

            queryClient.invalidateQueries({ queryKey: ['/api/reviews'] });
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      wsRef.current.onclose = () => {
        setIsConnected(false);
        if (!isClosingRef.current) {
          reconnectTimeoutRef.current = setTimeout(connect, 3000);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error("WebSocket connection error:", error);
      };
    } catch (error) {
      console.error("Failed to create WebSocket connection", error);
      setIsConnected(false);
    }
  }, [playNotificationSound, toast, queryClient]);

  const disconnect = useCallback(() => {
    isClosingRef.current = true;
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setTimeout(() => {
      isClosingRef.current = false;
    }, 100);
  }, []);

  useEffect(() => {
    connect();

    const handleBeforeUnload = () => {
      isClosingRef.current = true;
      if (wsRef.current) {
        wsRef.current.close();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      disconnect();
    };
  }, [connect, disconnect]);

  return { connect, disconnect, isConnected };
}