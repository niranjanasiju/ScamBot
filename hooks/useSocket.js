import { useEffect, useState, useCallback } from 'react'
import { io } from 'socket.io-client'

export const useSocket = (username) => {
  const [socket, setSocket] = useState(null)
  const [messages, setMessages] = useState([])
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState(null)

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
      setIsConnected(false)
    }

    const handleChatJoined = (data) => {
      setMessages(data.messages || [])
    }

    const handleNewMessage = (message) => {
      setMessages(prev => [...prev, message])
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
    sendMessage,
    disconnect
  }
} 