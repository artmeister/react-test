import React, { useState, useEffect } from "react";
import axios from "axios";
import Modal from "react-modal";

Modal.setAppElement("#root");

const EditableTree = () => {
	const [modalIsOpen, setModalIsOpen] = useState(false);
	const [currentNode, setCurrentNode] = useState(null);
	const [nodeName, setNodeName] = useState("");
	const [modalMode, setModalMode] = useState(""); // "add" или "edit"
	const [rootId, setRootId] = useState(null);
	const [treeData, setTreeData] = useState([]);
	const treeId = "{3fa85f64-5717-4562-b3fc-2c963f66afa6}"; // Уникальный идентификатор дерева

	// Функция для загрузки данных дерева
	const loadTreeData = () => {
		axios
			.get(`https://test.vmarmysh.com/api.user.tree.get`, {
				params: {
					treeName: treeId,
				},
			})
			.then((response) => {
				setRootId(response.data.id);
				setTreeData(response.data.children);
				console.log("Загрузка данных дерева", response.data);
			})
			.catch((error) => {
				console.error("Ошибка при загрузке дерева:", error);
			});
	};

	useEffect(() => {
		// Загрузка данных дерева при загрузке компонента
		loadTreeData();
	}, []);

	const openModal = (mode, node = null) => {
		setModalMode(mode);
		setCurrentNode(node);
		setNodeName(node ? node.name : "");
		setModalIsOpen(true);
	};

	const closeModal = () => {
		setModalIsOpen(false);
		setCurrentNode(null);
		setNodeName("");
	};

	const handleSave = () => {
		if (modalMode === "add") {
			addNode(currentNode ? currentNode.id : rootId, nodeName);
		} else if (modalMode === "edit") {
			renameNode(currentNode.id, nodeName);
		}
		closeModal();
	};

	const addNode = (parentId, nodeName) => {
		axios
			.get("https://test.vmarmysh.com/api.user.tree.node.create", {
				params: {
					treeName: treeId,
					parentNodeId: parentId,
					nodeName: nodeName,
				},
			})
			.then((response) => {
				loadTreeData();
			})
			.catch((error) => {
				console.error("Ошибка при создании узла:", error);
			});
	};

	const renameNode = (nodeId, nodeName) => {
		axios
			.get(`https://test.vmarmysh.com/api.user.tree.node.rename`, {
				params: {
					treeName: treeId,
					nodeId: nodeId,
					newNodeName: nodeName,
				},
			})
			.then((response) => {
				loadTreeData();
			})
			.catch((error) => {
				console.error("Ошибка при обновлении узла:", error);
			});
	};

	const deleteNode = (nodeId) => {
		axios
			.get(`https://test.vmarmysh.com/api.user.tree.node.delete`, {
				params: {
					treeName: treeId,
					nodeId: nodeId,
				},
			})
			.then(() => {
				loadTreeData();
			})
			.catch((error) => {
				console.error("Ошибка при удалении узла:", error);
			});
	};

	const renderTree = (nodes) => {
		return nodes.map((node) => (
			<li key={node.id}>
				{node.name}

				<div className=''>
					<button onClick={() => openModal("edit", node)}>Редактировать</button>
					<button onClick={() => openModal("add", node)}>Добавить</button>
					<button onClick={() => deleteNode(node.id)}>Удалить</button>
				</div>

				{node.children && <ul>{renderTree(node.children)}</ul>}
			</li>
		));
	};

	return (
		<div>
			<h1>Редактируемое Дерево</h1>
			<button onClick={() => openModal("add")}>Добавить корневой узел</button>
			<ul>{renderTree(treeData)}</ul>

			<Modal
				isOpen={modalIsOpen}
				onRequestClose={closeModal}
				contentLabel='Редактировать узел'
				style={{
					content: {
						top: "50%",
						left: "50%",
						right: "auto",
						bottom: "auto",
						marginRight: "-50%",
						transform: "translate(-50%, -50%)",
					},
				}}
			>
				<h2>{modalMode === "add" ? "Добавить узел" : "Редактировать узел"}</h2>
				<input
					type='text'
					value={nodeName}
					onChange={(e) => setNodeName(e.target.value)}
				/>
				<button onClick={handleSave}>
					{modalMode === "add" ? "Добавить" : "Сохранить"}
				</button>
				<button onClick={closeModal}>Отмена</button>
			</Modal>
		</div>
	);
};

export default EditableTree;
