import { useEffect, useState, useCallback } from 'react'
import { io } from 'socket.io-client'

export const useSocket = (username) => {
  const [socket, setSocket] = useState(null)
  const [messages, setMessages] = useState([])
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState(null)
  const [botIsTyping, setBotIsTyping] = useState(false)

  useEffect(() => {
    if (!username) return

    const newSocket = io('http://localhost:3001', {
      transports: ['websocket']
    })

    const handleConnect = () => {
      setIsConnected(true)
      setConnectionError(null)
      newSocket.emit('joinChat', { username })
    }

    const handleDisconnect = () => {
      newSocket.emit('leaveChat')
      setIsConnected(false)
      setBotIsTyping(false) // Reset typing indicator on disconnect
    }

    const handleChatJoined = (data) => {
      setMessages(data.messages || [])
    }

    const handleNewMessage = (message) => {
      setMessages(prev => [...prev, message])
      // If this is a bot message, stop the typing indicator
      if (message.username === 'bot') {
        setBotIsTyping(false)
      }
    }

    const handleError = (error) => {
      setConnectionError(error)
    }

    newSocket.on('connect', handleConnect)
    newSocket.on('disconnect', handleDisconnect)
    newSocket.on('chatJoined', handleChatJoined)
    newSocket.on('newMessage', handleNewMessage)
    newSocket.on('error', handleError)

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [username])

  const sendMessage = useCallback((message) => {
    if (!socket || !isConnected || !message.trim()) return false

    const messageData = {
      username,
      message: message.trim(),
      timestamp: new Date()
    }

    socket.emit('sendMessage', messageData)
    // Set bot typing indicator when user sends a message
    setBotIsTyping(true)
    return true
  }, [socket, isConnected, username])

  const disconnect = useCallback(() => {
    if (socket) {
      socket.disconnect()
    }
  }, [socket])

  return {
    socket,
    messages,
    isConnected,
    connectionError,
    botIsTyping,
    sendMessage,
    disconnect
  }
} 
