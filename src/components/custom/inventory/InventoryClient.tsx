'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
}

interface InventoryClientProps {
  initialInventory: InventoryItem[];
}

const InventoryClient: React.FC<InventoryClientProps> = ({ initialInventory }) => {
  const [inventory, setInventory] = useState(initialInventory);
  const [newItem, setNewItem] = useState({ name: '', quantity: 0, unit: '' });

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || newItem.quantity <= 0) return;

    // Normally you'd call your API here
    const addedItem = { ...newItem, id: Date.now().toString() };
    setInventory([addedItem, ...inventory]);
    setNewItem({ name: '', quantity: 0, unit: '' });
  };

  return (
    <Card className="shadow-xl rounded-xl p-6">
      <CardHeader>
        <CardTitle className="text-2xl">Inventory</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add Item Form */}
        <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <Input
            placeholder="Item Name"
            value={newItem.name}
            onChange={e => setNewItem({ ...newItem, name: e.target.value })}
          />
          <Input
            type="number"
            placeholder="Quantity"
            value={newItem.quantity}
            onChange={e => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
          />
          <Input
            placeholder="Unit (pcs/kg/etc)"
            value={newItem.unit}
            onChange={e => setNewItem({ ...newItem, unit: e.target.value })}
          />
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
            Add Item
          </Button>
        </form>

        {/* Inventory List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {inventory.map(item => (
            <Card key={item.id} className="shadow-md rounded-lg p-4 hover:shadow-lg transition">
              <CardHeader className="flex justify-between items-center">
                <CardTitle className="text-lg">{item.name}</CardTitle>
                <span className="text-sm text-gray-500">{item.unit}</span>
              </CardHeader>
              <CardContent>
                <p>Quantity: {item.quantity}</p>
                <Button className="mt-2 w-full bg-green-600 hover:bg-green-700 text-white">
                  Update
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default InventoryClient;
