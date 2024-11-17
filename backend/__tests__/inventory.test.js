const request = require('supertest');
const app = require('../server');

describe('Inventory API Endpoints', () => {
    let testItemId;

    // Test item data
    const testItem = {
        ProductName: 'Test Product',
        ProductDescription: 'Test Description',
        InventoryQuantity: 10,
        Price: 19.99,
        Tag: 'test'
    };

    // Test GET /api/inventory
    test('GET /api/inventory should return all inventory items', async () => {
        const res = await request(app)
            .get('/api/inventory')
            .expect('Content-Type', /json/)
            .expect(200);

        expect(Array.isArray(res.body)).toBeTruthy();
    });

    // Test POST /api/add-inventory
    test('POST /api/add-inventory should create a new item', async () => {
        const res = await request(app)
            .post('/api/add-inventory')
            .send(testItem)
            .expect('Content-Type', /json/)
            .expect(201);

        expect(res.body).toHaveProperty('message', 'Item added successfully');
        expect(res.body).toHaveProperty('productId');
        testItemId = res.body.productId; // Save for later tests
    });

    // Test PUT /api/inventory/:id
    test('PUT /api/inventory/:id should update an existing item', async () => {
        const updatedData = {
            ...testItem,
            ProductName: 'Updated Test Product',
            InventoryQuantity: 15
        };

        const res = await request(app)
            .put(`/api/inventory/${testItemId}`)
            .send(updatedData)
            .expect('Content-Type', /json/)
            .expect(200);

        expect(res.body).toHaveProperty('message', 'Inventory item updated successfully');
    });

    // Test invalid update
    test('PUT /api/inventory/:id should fail with invalid data', async () => {
        const invalidData = {
            ProductName: '',
            InventoryQuantity: -1,
            Price: -10
        };

        const res = await request(app)
            .put(`/api/inventory/${testItemId}`)
            .send(invalidData)
            .expect('Content-Type', /json/)
            .expect(400);
    });

    // Test DELETE /api/inventory/:id
    test('DELETE /api/inventory/:id should delete an item', async () => {
        const res = await request(app)
            .delete(`/api/inventory/${testItemId}`)
            .expect('Content-Type', /json/)
            .expect(200);

        expect(res.body).toHaveProperty('message', 'Inventory item deleted successfully');
    });

    // Test deleting non-existent item
    test('DELETE /api/inventory/:id should fail for non-existent item', async () => {
        const res = await request(app)
            .delete('/api/inventory/999999')
            .expect('Content-Type', /json/)
            .expect(404);
    });
});
