"use client"

import { useState } from 'react'
import * as z from 'zod'
import { 
  Form, 
  Input, 
  Button, 
  Table, 
  Message 
} from '@arco-design/web-react'

const productSchema = z.object({
  name: z.string().min(1, { message: "Product name is required" }),
  price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Price must be a positive number",
  }),
  quantity: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "Quantity must be a non-negative number",
  }),
})

type Product = z.infer<typeof productSchema> & { id: number }

export default function ERPPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [form] = Form.useForm()

  function onSubmit(values: any) {
    const newProduct: Product = {
      id: Date.now(),
      ...values,
    }
    setProducts([...products, newProduct])
    form.resetFields()
    Message.success('The new product has been added to the inventory.')
  }

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
    },
    {
      title: 'Price',
      dataIndex: 'price',
      render: (price: string) => `$${Number(price).toFixed(2)}`,
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
    },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">ERP System</h1>
      
      <Form
        form={form}
        onSubmit={onSubmit}
        layout="vertical"
        className="space-y-4"
      >
        <Form.Item
          label="Product Name"
          field="name"
          rules={[
            { required: true, message: 'Product name is required' }
          ]}
        >
          <Input placeholder="Enter product name" />
        </Form.Item>

        <Form.Item
          label="Price"
          field="price"
          rules={[
            { required: true, message: 'Price is required' },
            {
              validator: (value) => {
                if (isNaN(Number(value)) || Number(value) <= 0) {
                  return 'Price must be a positive number'
                }
                return true
              }
            }
          ]}
        >
          <Input type="number" step="0.01" placeholder="Enter price" />
        </Form.Item>

        <Form.Item
          label="Quantity"
          field="quantity"
          rules={[
            { required: true, message: 'Quantity is required' },
            {
              validator: (value) => {
                if (isNaN(Number(value)) || Number(value) < 0) {
                  return 'Quantity must be a non-negative number'
                }
                return true
              }
            }
          ]}
        >
          <Input type="number" placeholder="Enter quantity" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Add Product
          </Button>
        </Form.Item>
      </Form>

      <Table
        columns={columns}
        data={products}
        rowKey="id"
        border={false}
        className="mt-6"
      />
    </div>
  )
}