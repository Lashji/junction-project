'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Textarea } from "~/components/ui/textarea"
import { Checkbox } from "~/components/ui/checkbox"
import { Label } from "~/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "~/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Switch } from "~/components/ui/switch"

export default function CreatePoll() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [option1, setOption1] = useState('')
  const [option2, setOption2] = useState('')
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [showDemographics, setShowDemographics] = useState(false)
  const [gender, setGender] = useState<string>('')
  const [minAge, setMinAge] = useState(18)
  const [maxAge, setMaxAge] = useState(65)
  const [useAgeRange, setUseAgeRange] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log({
      id: Date.now(),
      title,
      description,
      options: [option1, option2],
      verifiedOnly,
      demographics: verifiedOnly && showDemographics ? { 
        gender, 
        ageRange: useAgeRange ? [minAge, maxAge] : null 
      } : null
    })
    router.push('/')
  }

  const handleAgeChange = (type: 'min' | 'max', value: string) => {
    const numValue = parseInt(value, 10)
    if (isNaN(numValue)) return

    if (type === 'min') {
      setMinAge(Math.min(Math.max(13, numValue), maxAge))
    } else {
      setMaxAge(Math.max(Math.min(100, numValue), minAge))
    }
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-4xl mx-auto text-foreground">
        <CardHeader>
          <CardTitle className='text-4xl' >Create a New Poll</CardTitle>
          <CardDescription>Fill out the form below to create a new poll.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Poll Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value.slice(0, 144))}
                required
                maxLength={144}
              />
              <p className="text-sm text-muted-foreground">{title.length}/144 characters</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, 500))}
                required
                maxLength={500}
              />
              <p className="text-sm text-muted-foreground">{description.length}/500 characters</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="option1">Option 1</Label>
                <Input
                  id="option1"
                  value={option1}
                  onChange={(e) => setOption1(e.target.value.slice(0, 24))}
                  required
                  maxLength={24}
                />
                <p className="text-sm text-muted-foreground">{option1.length}/24 characters</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="option2">Option 2</Label>
                <Input
                  id="option2"
                  value={option2}
                  onChange={(e) => setOption2(e.target.value.slice(0, 24))}
                  required
                  maxLength={24}
                />
                <p className="text-sm text-muted-foreground">{option2.length}/24 characters</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 bg-secondary p-4 rounded-lg">
              <Checkbox
                id="verifiedOnly"
                checked={verifiedOnly}
                onCheckedChange={(checked) => {
                  setVerifiedOnly(checked as boolean)
                  if (!checked) {
                    setShowDemographics(false)
                  }
                }}
              />
              <Label htmlFor="verifiedOnly" className="font-bold">Allow votes from verified users only</Label>
            </div>
            {verifiedOnly && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="showDemographics" className="text-lg font-semibold">Voter Demographics</Label>
                  <Switch
                    id="showDemographics"
                    checked={showDemographics}
                    onCheckedChange={setShowDemographics}
                  />
                </div>
                {showDemographics && (
                  <div className="space-y-4 bg-secondary p-4 rounded-lg">
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <Select value={gender} onValueChange={setGender}>
                        <SelectTrigger id="gender">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="useAgeRange">Age Range</Label>
                        <Switch
                          id="useAgeRange"
                          checked={useAgeRange}
                          onCheckedChange={setUseAgeRange}
                        />
                      </div>
                      {useAgeRange && (
                        <div className="flex items-center space-x-2">
                          <Input
                            type="number"
                            min={13}
                            max={maxAge}
                            value={minAge}
                            onChange={(e) => handleAgeChange('min', e.target.value)}
                            className="w-20"
                          />
                          <span>to</span>
                          <Input
                            type="number"
                            min={minAge}
                            max={100}
                            value={maxAge}
                            onChange={(e) => handleAgeChange('max', e.target.value)}
                            className="w-20"
                          />
                          <span>years old</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </form>
        </CardContent>
        <CardFooter>
          <Button type="submit" onClick={handleSubmit}>Create Poll</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
