import { Link, Outlet, useNavigate, useParams } from 'react-router-dom';
import { useQuery,useMutation,} from '@tanstack/react-query';
import Header from '../Header.jsx';
import { deleteEvent, fetchEvent ,queryClient} from '../../util/http.js';
import ErrorBlock from '../UI/ErrorBlock.jsx';
import Modal from '../UI/Modal.jsx'
import { useState } from 'react';


export default function EventDetails() {

  const [ isDeleting , setIsDeleting] = useState(false)
  const params = useParams()
  const navigate = useNavigate()
  console.log("jdnksjbfkd",params.id)
  const { data , isPending,isError, error} = useQuery({
    queryKey : ["events" ,params.id ],
    queryFn: ({ signal }) => fetchEvent({signal ,id :params.id})
  })

  const { mutate , isPending : isPendingDeletion , isError : isErrorDeletion , error : deleteError} =useMutation({
    mutationFn : deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey:['events'],
        refetchType: "none"
      })
      navigate("/events")
    }
  })

  function handleStartDelete(){
    setIsDeleting(true)
  }

  function handleStopDelete(){
    setIsDeleting(false)
  }

  function handleDelete(){
    mutate({ id : params.id })
  }

  let content ;
  if (isPending){
    content = (
      <div id='event-details-content' className='center'>
      <p>Fetching event data...</p>
    </div>
    )
  }

  if(isError){
    content =(
      <div id='event-details-content' className='center'>
        <ErrorBlock title='' message={error.info?.message || 'Failed to fetch event data , please try again later.'} />
      </div>
    )
  }

  if (data){
    content = (
      <>
       <header>
          <h1>{data.title}</h1>
          <nav>
            <button onClick={handleStartDelete}>Delete</button>
            <Link to="edit">Edit</Link>
          </nav>
        </header>
      <div id="event-details-content">
      <img src={`http://localhost:3000/${data.image}`} alt="" />
      <div id="event-details-info">
        <div>
          <p id="event-details-location">{data.location}</p>
          <time dateTime={`Todo-DateT$Todo-Time`}>{data.date} @ {data.time}</time>
        </div>
        <p id="event-details-description">{data.description}</p>
      </div>
    </div>
      </>
    )
  }
  return (
    <>
    { isDeleting && (
      <Modal onClose={handleStopDelete}>
      <h2>Are you sure ? </h2>
      <p>Do you really want to delete this event ? this action cannot be undone.</p>
      <div className='form-actions'>
          { isPendingDeletion && <p>Deleting ,please wait ...</p>}
          { !isPendingDeletion && (
            <>
            <button onClick={handleStopDelete} className='button-text'>Cancel</button>
            <button onClick={handleDelete} className='button'>Delete</button>
            </>
          )}
          { isErrorDeletion && <ErrorBlock title='Failed to delete event' message={deleteError.info?.message || 'Failed to delete event, please try again later.'} />}
          
      </div>
    </Modal>
    )}
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      <article id="event-details">
       {content}
      </article>
    </>
  );
}
