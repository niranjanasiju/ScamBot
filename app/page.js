'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Send } from 'lucide-react'
import { useSocket } from '@/hooks/useSocket'

export default function Home() {
  const [username, setUsername] = useState('')
  const [newMessage, setNewMessage] = useState('')
  const [hasJoined, setHasJoined] = useState(false)
  const messagesEndRef = useRef(null)

  const {
    messages,
    isConnected,
    connectionError,
    sendMessage,
    disconnect
  } = useSocket(username)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (connectionError) {
      alert(connectionError)
    }
  }, [connectionError])

  const handleJoinChat = (e) => {
    e.preventDefault()
    if (!username.trim()) return
    setHasJoined(true)
  }

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (sendMessage(newMessage)) {
      setNewMessage('')
    }
  }

  const handleLeaveChat = () => {
    disconnect()
    setHasJoined(false)
    setUsername('')
  }

  if (!hasJoined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold text-gray-800">
                Chatbot
              </CardTitle>
              <CardDescription className="text-gray-600">
                Enter your name to start chatting with our bot
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleJoinChat} className="space-y-4">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name
                  </label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your name"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    maxLength={20}
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={!username.trim()}
                >
                  Start Chatting
                </Button>
              </form>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">How it works:</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Enter your name to begin</li>
                  <li>• Chat with our friendly bot</li>
                  <li>• Get instant responses</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto h-screen flex flex-col">
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Chatbot</CardTitle>
                <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                  <span>Welcome, {username}!</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                    isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLeaveChat}
                className="flex items-center gap-2"
              >
                Leave Chat
              </Button>
            </div>
          </CardHeader>
        </Card>

        <Card className="flex-1 flex flex-col">
          <CardContent className="flex-1 flex flex-col p-0">
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 mt-8">
                  <p>Say hello to start the conversation!</p>
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div
                    key={msg.id || index}
                    className={`flex ${msg.type === 'system' ? 'justify-center' : 
                      msg.username === username ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.type === 'system' ? (
                      <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        {msg.message}
                      </div>
                    ) : (
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          msg.username === username
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-500 text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-medium ${
                            msg.username === username ? 'text-blue-100' : 'text-gray-200'
                          }`}>
                            {msg.username === username ? 'You' : 'Bot'}
                          </span>
                          <span className={`text-xs ${
                            msg.username === username ? 'text-blue-200' : 'text-gray-300'
                          }`}>
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm">{msg.message}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t p-4">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  disabled={!isConnected}
                  maxLength={500}
                  className="flex-1"
                />
                <Button
                  type="submit"
                  disabled={!newMessage.trim() || !isConnected}
                  size="sm"
                  className="px-3"
                >
                  <Send size={16} />
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
